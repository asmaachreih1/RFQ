<?php

namespace backend\modules\api\controllers;

use common\models\Category;
use yii\rest\ActiveController;
use yii\filters\auth\HttpBearerAuth;

class CategoryController extends ActiveController
{
    public $modelClass = Category::class;
    
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
        // Disable actions we don't need or want to restrict
        unset($actions['create'], $actions['update'], $actions['delete']); 
        return $actions;
    }
}
