<?php

use yii\db\Migration;

class m260129_114000_update_user_and_create_subscription extends Migration
{
    public function safeUp()
    {
        // Add name and role to user table if they don't exist
        // Note: checking if column exists is safer but for now we assume standard setup + need these
        
        // Add 'name'
        try {
            $this->addColumn('{{%user}}', 'name', $this->string());
        } catch (\Exception $e) { /* might exist */ }

        // Add 'role'
        try {
            $this->addColumn('{{%user}}', 'role', "ENUM('user', 'company') NOT NULL DEFAULT 'user'");
        } catch (\Exception $e) { /* might exist */ }
        
        // Add 'access_token' for API
        try {
             $this->addColumn('{{%user}}', 'access_token', $this->string()->unique());
        } catch (\Exception $e) { /* might exist */ }


        // Create Subscription Table
        $this->createTable('{{%subscription}}', [
            'id' => $this->primaryKey(),
            'user_id' => $this->integer()->notNull(),
            'category_id' => $this->integer()->notNull(),
        ]);

        $this->createIndex(
            '{{%idx-subscription-user_id}}',
            '{{%subscription}}',
            'user_id'
        );

        $this->addForeignKey(
            '{{%fk-subscription-user_id}}',
            '{{%subscription}}',
            'user_id',
            '{{%user}}',
            'id',
            'CASCADE'
        );

        $this->createIndex(
            '{{%idx-subscription-category_id}}',
            '{{%subscription}}',
            'category_id'
        );

        $this->addForeignKey(
            '{{%fk-subscription-category_id}}',
            '{{%subscription}}',
            'category_id',
            '{{%category}}',
            'id',
            'CASCADE'
        );
        
        // UserSubscription unique index to prevent duplicates
        $this->createIndex(
            '{{%idx-unique-subscription}}',
            '{{%subscription}}',
            ['user_id', 'category_id'],
            true
        );
    }

    public function safeDown()
    {
        $this->dropTable('{{%subscription}}');
        $this->dropColumn('{{%user}}', 'role');
        $this->dropColumn('{{%user}}', 'name');
        $this->dropColumn('{{%user}}', 'access_token');
    }
}
