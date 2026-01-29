<?php

use yii\db\Migration;

/**
 * Class m260129_161646_add_payment_terms_to_quotation
 */
class m260129_161646_add_payment_terms_to_quotation extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('{{%quotation}}', 'delivery_cost', $this->decimal(10, 2)->defaultValue(0));
        $this->addColumn('{{%quotation}}', 'payment_terms', $this->string()->null());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('{{%quotation}}', 'delivery_cost');
        $this->dropColumn('{{%quotation}}', 'payment_terms');
    }
}
