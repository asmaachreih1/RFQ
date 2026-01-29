<?php

namespace backend\modules\api\controllers;

use common\models\Quotation;
use common\models\Rfq;
use common\models\User;
use Yii;
use yii\data\ActiveDataProvider;
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\ServerErrorHttpException;

class QuotationController extends ActiveController
{
    public $modelClass = 'common\models\Quotation';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
        ];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        // Disable default create to handle custom logic
        unset($actions['create']);
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $request = Yii::$app->request;
        $rfqId = $request->getQueryParam('rfqId');
        
        $user = Yii::$app->user->identity;
        /** @var User $user */

        $query = Quotation::find();

        if ($rfqId) {
            $query->andWhere(['rfq_id' => $rfqId]);
            
            // Security check:
            // If User: must own the RFQ
            // If Company: can only see their own quote for this RFQ (or maybe n/a?)
            // Actually, normally companies shouldn't see other quotes.
            
            $rfq = Rfq::findOne($rfqId);
            if (!$rfq) {
                // If filtering by invalid RFQ, return empty or throw? 
                // Let's safe fail to empty
                $query->andWhere('0=1');
                return new ActiveDataProvider(['query' => $query]);
            }
            
            if ($user->role === 'user') {
                if ($rfq->user_id !== $user->id) {
                    throw new ForbiddenHttpException('You do not own this request');
                }
            } elseif ($user->role === 'company') {
                 $query->andWhere(['company_id' => $user->id]);
            }
        } elseif ($user->role === 'company') {
            // List all my quotes
            $query->andWhere(['company_id' => $user->id]);
        } else {
             // User listing all received quotes? Maybe not useful without rfqId
             // But for safety, join with RFQ to ensure ownership
             $query->joinWith('rfq')->andWhere(['rfq.user_id' => $user->id]);
        }

        return new ActiveDataProvider([
            'query' => $query->orderBy(['total_price' => SORT_ASC]),
        ]);
    }

    public function actionCreate()
    {
        $user = Yii::$app->user->identity;
        if ($user->role !== 'company') {
             throw new ForbiddenHttpException('Only companies can submit quotations');
        }
        
        $model = new Quotation();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        
        // Validate RFQ
        $rfq = Rfq::findOne($model->rfq_id);
        if (!$rfq) throw new NotFoundHttpException('IRQ not found');
        if ($rfq->status !== 'OPEN') throw new ForbiddenHttpException('Request is not open');

        $model->company_id = $user->id;
        $model->status = 'PENDING';

        if ($model->save()) {
            \common\components\WSHelper::push([
                'type' => 'quotation.created',
                'rfqId' => $rfq->id,
                'rfqTitle' => $rfq->title,
                'rfqOwnerId' => $rfq->user_id, // Added for frontend filtering
                'company' => $user->name,
                'message' => "New Quote for: {$rfq->title}"
            ]);
            return $model;
        } elseif ($model->hasErrors()) {
             Yii::$app->response->statusCode = 422;
             return $model;
        }
        throw new ServerErrorHttpException('Failed to create object.');
    }
    
    // Custom action to accept/reject
    public function actionAccept($id, $rfqId)
    {
        // $rfqId param is redundant if we have $id, but let's follow existing pattern or just use ID
        // The API plan said POST /quotations/{id}/accept
        
        $user = Yii::$app->user->identity;
        $quote = Quotation::findOne($id);
        if (!$quote) throw new NotFoundHttpException('Quote not found');
        
        $rfq = $quote->rfq;
        if ($rfq->user_id !== $user->id) throw new ForbiddenHttpException('Unauthorized');
        
        if ($rfq->status !== 'OPEN') throw new ForbiddenHttpException('Request is already closed');
        
        $transaction = Yii::$app->db->beginTransaction();
        try {
            $quote->status = 'ACCEPTED';
            $quote->save(false);
            
            $rfq->status = 'AWARDED';
            $rfq->save(false);
            
            // Reject others
            Quotation::updateAll(['status' => 'REJECTED'], ['and', ['rfq_id' => $rfq->id], ['<>', 'id', $quote->id]]);
            
            $transaction->commit();
            
            \common\components\WSHelper::push([
                'type' => 'quotation.accepted',
                'rfqId' => $rfq->id,
                'message' => "Quote Accepted for: {$rfq->title}"
            ]);
            
            return ['status' => 'success', 'message' => 'Quotation accepted'];
        } catch(\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }
    }
    public function actionReject($id)
    {
        $user = Yii::$app->user->identity;
        $quote = Quotation::findOne($id);
        if (!$quote) throw new NotFoundHttpException('Quote not found');
        
        $rfq = $quote->rfq;
        if ($rfq->user_id !== $user->id) throw new ForbiddenHttpException('Unauthorized');
        
        if ($quote->status !== 'PENDING') throw new ForbiddenHttpException('Quote is already ' . $quote->status);
        
        $quote->status = 'REJECTED';
        if ($quote->save()) {
             return ['status' => 'success', 'message' => 'Quotation rejected'];
        }
        throw new ServerErrorHttpException('Failed to reject quotation');
    }

    public function actionWithdraw($id)
    {
        $user = Yii::$app->user->identity;
        $quote = Quotation::findOne($id);
        if (!$quote) throw new NotFoundHttpException('Quote not found');
        
        if ($quote->company_id !== $user->id) throw new ForbiddenHttpException('Unauthorized');
        
        if ($quote->status !== 'PENDING') throw new ForbiddenHttpException('Cannot withdraw quote that is ' . $quote->status);
        
        // Hard delete or soft delete? Requirement says "withdraw". 
        // Let's delete it so they can resubmit if they want.
        // Or change status to WITHDRAWN.
        // If I delete, history is lost. 
        // Let's set to status WITHDRAWN.
        $quote->status = 'WITHDRAWN';
        if ($quote->save()) {
             return ['status' => 'success', 'message' => 'Quotation withdrawn'];
        }
        throw new ServerErrorHttpException('Failed to withdraw quotation');
    }
}
