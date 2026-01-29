<?php

namespace backend\modules\api\controllers;

use common\models\Subscription;
use common\models\Category;
use Yii;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;
use yii\web\ForbiddenHttpException;
use yii\web\ServerErrorHttpException;

class SubscriptionController extends ActiveController
{
    public $modelClass = Subscription::class;
    
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
        ];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        unset($actions['create'], $actions['update'], $actions['delete']);
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];
        return $actions;
    }

    public function prepareDataProvider()
    {
        $user = Yii::$app->user->identity;
        // Allow both users and companies
        // if ($user->role !== 'company') {
        //      throw new ForbiddenHttpException('Only companies can subscribe to categories');
        // }

        return new \yii\data\ActiveDataProvider([
            'query' => Subscription::find()->where(['user_id' => $user->id]),
        ]);
    }
    
    // POST /api/subscription/toggle
    public function actionToggle()
    {
        $user = Yii::$app->user->identity;
        // Allow both users and companies
        // if ($user->role !== 'company') {
        //      throw new ForbiddenHttpException('Only companies can subscribe');
        // }
        
        $categoryId = Yii::$app->request->post('category_id');
        if (!$categoryId) {
             throw new \yii\web\BadRequestHttpException('Missing category_id');
        }
        
        $sub = Subscription::findOne(['user_id' => $user->id, 'category_id' => $categoryId]);
        
        if ($sub) {
            if ($sub->delete() === false) {
                 throw new ServerErrorHttpException('Failed to remove subscription');
            }
            return ['status' => 'removed', 'category_id' => $categoryId];
        } else {
            // Validate category
            if (!Category::findOne($categoryId)) {
                 throw new \yii\web\NotFoundHttpException('Category not found');
            }
            
            $sub = new Subscription();
            $sub->user_id = $user->id;
            $sub->category_id = $categoryId;
            if ($sub->save()) {
                 return ['status' => 'added', 'category_id' => $categoryId];
            }
            throw new ServerErrorHttpException('Failed to add subscription');
        }
    }
}
