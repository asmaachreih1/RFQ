<?php

namespace backend\modules\api\controllers;

use common\models\Rfq;
use common\models\User;
use Yii;
use yii\data\ActiveDataProvider;
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class RfqController extends ActiveController
{
    public $modelClass = 'common\models\Rfq';

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
        // Customize index to filter by user role
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $user = Yii::$app->user->identity;
        /** @var User $user */

        $query = Rfq::find();

        if ($user->role === 'user') {
            // User sees only their own requests
            $query->andWhere(['user_id' => $user->id]);
        } else {
            // Company sees OPEN requests
            // Ideally filter by subscriptions, but for now show all OPEN
            $query->andWhere(['status' => 'OPEN']);
        }
        
        $query->orderBy(['created_at' => SORT_DESC]);

        return new ActiveDataProvider([
            'query' => $query,
        ]);
    }
    
    // Override create to auto-set user_id
    public function actionCreate()
    {
        $user = Yii::$app->user->identity;
        if ($user->role !== 'user') {
             throw new ForbiddenHttpException('Only users can create requests');
        }
        
        $model = new Rfq();
        $model->load(Yii::$app->getRequest()->getBodyParams(), '');
        $model->user_id = $user->id;
        $model->status = 'OPEN';
        
        // Lookup Status (mock)
        // ...
        
        if ($model->save()) {
            // Trigger WebSocket event
            \common\components\WSHelper::push([
                'type' => 'rfq.created',
                'id' => $model->id,
                'title' => $model->title,
                'categoryId' => $model->category_id,
                'category' => $model->category->name ?? '',
                'message' => "New Request: {$model->title}"
            ]);
            return $model;
        } elseif ($model->hasErrors()) {
             Yii::$app->response->statusCode = 422;
             return $model;
        }
        throw new \yii\web\ServerErrorHttpException('Failed to create object.');
    }
    
    // Basic ActiveController handles View/Update/Delete but we might want to restrict them
    public function checkAccess($action, $model = null, $params = [])
    {
        $user = Yii::$app->user->identity;
        
        if ($action === 'view') {
            if ($user->role === 'user' && $model->user_id !== $user->id) {
                 throw new ForbiddenHttpException('You can only view your own requests');
            }
            if ($user->role === 'company' && $model->status !== 'OPEN') {
                 // Companies can generally only view OPEN requests, or ones they quoted on?
                 // For now simplicity: OPEN.
                 throw new ForbiddenHttpException('This request is no longer available');
            }
        }
        
        // Only owner can update/delete
        if (($action === 'update' || $action === 'delete') && $model->user_id !== $user->id) {
            throw new ForbiddenHttpException('You can only modify your own requests');
        }
        
        // Companies cannot delete/update requests at all
        if (($action === 'update' || $action === 'delete') && $user->role === 'company') {
             throw new ForbiddenHttpException('Companies cannot modify requests');
        }
        
        // Company cannot create
        if ($action === 'create' && $user->role === 'company') {
             throw new ForbiddenHttpException('Companies cannot create requests');
        }
    }
}
