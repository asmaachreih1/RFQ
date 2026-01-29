<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "rfq".
 *
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property int $category_id
 * @property string $quantity
 * @property string|null $description
 * @property string|null $delivery_date
 * @property string|null $city
 * @property string $status
 * @property int $created_at
 * @property int $updated_at
 *
 * @property Category $category
 * @property Quotation[] $quotations
 * @property User $user
 */
class Rfq extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'rfq';
    }
    
    public function behaviors()
    {
        return [
            TimestampBehavior::class,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['user_id', 'title', 'category_id', 'quantity'], 'required'],
            [['user_id', 'category_id', 'created_at', 'updated_at'], 'integer'],
            [['description', 'status'], 'string'],
            [['delivery_date', 'expiration_date'], 'safe'],
            [['budget_min', 'budget_max', 'latitude', 'longitude'], 'number'],
            [['title', 'quantity', 'city'], 'string', 'max' => 255],
            [['category_id'], 'exist', 'skipOnError' => true, 'targetClass' => Category::class, 'targetAttribute' => ['category_id' => 'id']],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['user_id' => 'id']],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'title' => 'Title',
            'category_id' => 'Category',
            'quantity' => 'Quantity',
            'description' => 'Description',
            'delivery_date' => 'Delivery Date',
            'city' => 'City',
            'status' => 'Status',
            'created_at' => 'Created At',
            'updated_at' => 'Updated At',
        ];
    }
    
    public function fields()
    {
        $fields = parent::fields();
        $fields['userName'] = function($model) {
            return $model->user->name;
        };
        $fields['category'] = function($model) {
            return $model->category->name;
        };
        return $fields;
    }

    /**
     * Gets query for [[Category]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getCategory()
    {
        return $this->hasOne(Category::class, ['id' => 'category_id']);
    }

    /**
     * Gets query for [[Quotations]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getQuotations()
    {
        return $this->hasMany(Quotation::class, ['rfq_id' => 'id']);
    }

    /**
     * Gets query for [[User]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(User::class, ['id' => 'user_id']);
    }
}
