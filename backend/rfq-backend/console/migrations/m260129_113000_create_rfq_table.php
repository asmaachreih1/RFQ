<?php

use yii\db\Migration;

class m260129_113000_create_rfq_table extends Migration
{
    public function safeUp()
    {
        $this->createTable('{{%rfq}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'title' => $this->string()->notNull(),
            'category_id' => $this->integer()->notNull(),
            'quantity' => $this->string()->notNull(),
            'description' => $this->text(),
            'delivery_date' => $this->date(),
            'city' => $this->string(),
            'status' => "ENUM('OPEN', 'AWARDED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN'",
            'created_at' => $this->integer()->notNull(),
            'updated_at' => $this->integer()->notNull(),
        ]);

        // FK for User
        $this->createIndex(
            '{{%idx-rfq-user_id}}',
            '{{%rfq}}',
            'user_id'
        );

        $this->addForeignKey(
            '{{%fk-rfq-user_id}}',
            '{{%rfq}}',
            'user_id',
            '{{%user}}',
            'id',
            'CASCADE'
        );

        // FK for Category
        $this->createIndex(
            '{{%idx-rfq-category_id}}',
            '{{%rfq}}',
            'category_id'
        );

        $this->addForeignKey(
            '{{%fk-rfq-category_id}}',
            '{{%rfq}}',
            'category_id',
            '{{%category}}',
            'id',
            'CASCADE'
        );
    }

    public function safeDown()
    {
        $this->dropForeignKey('{{%fk-rfq-user_id}}', '{{%rfq}}');
        $this->dropIndex('{{%idx-rfq-user_id}}', '{{%rfq}}');
        $this->dropForeignKey('{{%fk-rfq-category_id}}', '{{%rfq}}');
        $this->dropIndex('{{%idx-rfq-category_id}}', '{{%rfq}}');
        $this->dropTable('{{%rfq}}');
    }
}
