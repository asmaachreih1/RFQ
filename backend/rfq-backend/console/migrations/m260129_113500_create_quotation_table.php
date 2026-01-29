<?php

use yii\db\Migration;

class m260129_113500_create_quotation_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%quotation}}', [
            'id' => $this->primaryKey(),
            'rfq_id' => $this->integer()->notNull(),
            'company_id' => $this->integer()->notNull(),
            'price_per_unit' => $this->decimal(10, 2)->notNull(),
            'total_price' => $this->decimal(10, 2)->notNull(),
            'delivery_days' => $this->integer()->notNull(),
            'valid_until' => $this->date()->notNull(),
            'notes' => $this->text(),
            'status' => "ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING'",
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        // FK for RFQ
        $this->createIndex(
            '{{%idx-quotation-rfq_id}}',
            '{{%quotation}}',
            'rfq_id'
        );

        $this->addForeignKey(
            '{{%fk-quotation-rfq_id}}',
            '{{%quotation}}',
            'rfq_id',
            '{{%rfq}}',
            'id',
            'CASCADE'
        );

        // FK for Company (User)
        $this->createIndex(
            '{{%idx-quotation-company_id}}',
            '{{%quotation}}',
            'company_id'
        );

        $this->addForeignKey(
            '{{%fk-quotation-company_id}}',
            '{{%quotation}}',
            'company_id',
            '{{%user}}',
            'id',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('{{%fk-quotation-rfq_id}}', '{{%quotation}}');
        $this->dropIndex('{{%idx-quotation-rfq_id}}', '{{%quotation}}');
        $this->dropForeignKey('{{%fk-quotation-company_id}}', '{{%quotation}}');
        $this->dropIndex('{{%idx-quotation-company_id}}', '{{%quotation}}');
        $this->dropTable('{{%quotation}}');
    }
}
