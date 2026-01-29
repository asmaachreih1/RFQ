<?php

namespace backend\modules\api\controllers;

use common\models\User;
use Yii;
use yii\rest\Controller;
use yii\web\ServerErrorHttpException;
use yii\web\UnauthorizedHttpException;

class AuthController extends Controller
{
    /**
     * @return array
     */
    public function actionRegister()
    {
        $request = Yii::$app->request;
        $email = $request->post('email');
        $password = $request->post('password');
        $role = $request->post('role', 'user');
        $name = $request->post('name');

        if (!$email || !$password) {
            Yii::$app->response->statusCode = 400;
            return ['error' => 'Email and password are required'];
        }

        if (User::findOne(['email' => $email])) {
            Yii::$app->response->statusCode = 409;
            return ['error' => 'Email already exists'];
        }

        $user = new User();
        $user->username = $email; // Use email as username
        $user->email = $email;
        $user->name = $name;
        $user->role = $role;
        $user->setPassword($password);
        $user->generateAuthKey();
        $user->status = User::STATUS_ACTIVE;
        $user->access_token = Yii::$app->security->generateRandomString();
        $user->created_at = time();
        $user->updated_at = time();

        if ($user->save()) {
            return [
                'id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'access_token' => $user->access_token,
            ];
        } elseif ($user->hasErrors()) {
            Yii::$app->response->statusCode = 422;
            return ['errors' => $user->getErrors()];
        } else {
            throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
        }
    }

    /**
     * @return array
     * @throws UnauthorizedHttpException
     */
    public function actionLogin()
    {
        $request = Yii::$app->request;
        $email = $request->post('email');
        $password = $request->post('password');

        $user = User::findOne(['email' => $email, 'status' => User::STATUS_ACTIVE]);

        if (!$user || !$user->validatePassword($password)) {
            throw new UnauthorizedHttpException('Invalid email or password');
        }

        // Ensure token exists
        if (empty($user->access_token)) {
            $user->access_token = Yii::$app->security->generateRandomString();
            $user->save(false);
        }

        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'access_token' => $user->access_token,
            'categorySubscriptions' => $user->getCategorySubscriptions() // We need to implement this in User model
        ];
    }

    public function actionMe()
    {
        $user = Yii::$app->user->identity;
        if (!$user) {
            throw new UnauthorizedHttpException('Not authenticated');
        }

        /** @var User $user */
        return [
            'id' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'role' => $user->role,
            'categorySubscriptions' => $user->getCategorySubscriptions()
        ];
    }
    
    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => \yii\filters\auth\HttpBearerAuth::class,
            'optional' => ['login', 'register'],
        ];
        return $behaviors;
    }
}
