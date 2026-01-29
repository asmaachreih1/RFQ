<?php

use yii\db\Migration;

/**
 * Class m260129_161006_add_details_to_rfq
 */
class m260129_161006_add_details_to_rfq extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn('{{%rfq}}', 'budget_min', $this->decimal(10, 2)->null());
        $this->addColumn('{{%rfq}}', 'budget_max', $this->decimal(10, 2)->null());
        $this->addColumn('{{%rfq}}', 'expiration_date', $this->date()->null());
        $this->addColumn('{{%rfq}}', 'latitude', $this->float()->null());
        $this->addColumn('{{%rfq}}', 'longitude', $this->float()->null());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('{{%rfq}}', 'budget_min');
        $this->dropColumn('{{%rfq}}', 'budget_max');
        $this->dropColumn('{{%rfq}}', 'expiration_date');
        $this->dropColumn('{{%rfq}}', 'latitude');
        $this->dropColumn('{{%rfq}}', 'longitude');
    }
}
