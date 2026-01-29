<?php

namespace common\models;

use Yii;
use yii\behaviors\TimestampBehavior;

/**
 * This is the model class for table "quotation".
 *
 * @property int $id
 * @property int $rfq_id
 * @property int $company_id
 * @property float $price_per_unit
 * @property float $total_price
 * @property int $delivery_days
 * @property string $valid_until
 * @property string|null $notes
 * @property string $status
 * @property int $created_at
 * @property int $updated_at
 *
 * @property User $company
 * @property Rfq $rfq
 */
class Quotation extends \yii\db\ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return 'quotation';
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
            [['rfq_id', 'company_id', 'price_per_unit', 'total_price', 'delivery_days', 'valid_until'], 'required'],
            [['rfq_id', 'company_id', 'delivery_days', 'created_at', 'updated_at'], 'integer'],
            [['price_per_unit', 'total_price', 'delivery_cost'], 'number'],
            [['valid_until'], 'safe'],
            [['notes', 'status', 'payment_terms'], 'string'],
            [['company_id'], 'exist', 'skipOnError' => true, 'targetClass' => User::class, 'targetAttribute' => ['company_id' => 'id']],
            [['rfq_id'], 'exist', 'skipOnError' => true, 'targetClass' => Rfq::class, 'targetAttribute' => ['rfq_id' => 'id']],
        ];
    }
    
    public function fields()
    {
        $fields = parent::fields();
        $fields['companyName'] = function($model) {
            return $model->company->name;
        };
        return $fields;
    }

    /**
     * Gets query for [[Company]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getCompany()
    {
        return $this->hasOne(User::class, ['id' => 'company_id']);
    }

    /**
     * Gets query for [[Rfq]].
     *
     * @return \yii\db\ActiveQuery
     */
    public function getRfq()
    {
        return $this->hasOne(Rfq::class, ['id' => 'rfq_id']);
    }
}
