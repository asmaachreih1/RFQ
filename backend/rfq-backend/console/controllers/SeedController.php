<?php

namespace console\controllers;

use common\models\Category;
use common\models\Quotation;
use common\models\Rfq;
use common\models\User;
use Yii;
use yii\console\Controller;
use yii\helpers\Console;

class SeedController extends Controller
{
    public function actionIndex()
    {
        $this->stdout("Starting Database Seeding...\n", Console::BOLD);

        // 1. Categories
        $this->stdout("- Seeding Categories...\n", Console::FG_YELLOW);
        $categories = ['Construction Materials', 'Furniture', 'Electronics', 'Logistics', 'Office Supplies', 'Machinery'];
        $catIds = [];
        
        foreach ($categories as $name) {
            $cat = Category::findOne(['name' => $name]);
            if (!$cat) {
                 $cat = new Category(['name' => $name, 'created_at' => time()]);
                 $cat->save();
            }
            $catIds[$name] = $cat->id;
        }

        // 2. Users (Buyers)
        $this->stdout("- Seeding Users (Buyers)...\n", Console::FG_YELLOW);
        $users = [];
        for ($i = 1; $i <= 5; $i++) {
            $email = "user{$i}@example.com";
            $user = User::findOne(['email' => $email]);
            if (!$user) {
                $user = new User();
                $user->username = $email;
                $user->email = $email;
                $user->name = "Buyer User {$i}";
                $user->role = 'user';
                $user->setPassword('password');
                $user->generateAuthKey();
                $user->status = User::STATUS_ACTIVE;
                $user->access_token = Yii::$app->security->generateRandomString();
                $user->save(false);
            }
            $users[] = $user;
        }

        // 3. Companies (Suppliers)
        $this->stdout("- Seeding Companies (Suppliers)...\n", Console::FG_YELLOW);
        $companies = [];
        for ($i = 1; $i <= 5; $i++) {
            $email = "company{$i}@example.com";
            $company = User::findOne(['email' => $email]);
            if (!$company) {
                $company = new User();
                $company->username = $email;
                $company->email = $email;
                $company->name = "Supplier Company {$i}";
                $company->role = 'company';
                $company->setPassword('password');
                $company->generateAuthKey();
                $company->status = User::STATUS_ACTIVE;
                $company->access_token = Yii::$app->security->generateRandomString();
                $company->save(false);
            }
            $companies[] = $company;
        }

        // 4. RFQs
        $this->stdout("- Seeding RFQs...\n", Console::FG_YELLOW);
        $rfqData = [
            ['title' => 'Bulk Steel Rods', 'cat' => 'Construction Materials', 'qty' => '50 tons'],
            ['title' => 'Office Desk Sets', 'cat' => 'Furniture', 'qty' => '20 sets'],
            ['title' => 'Laptops Core i7', 'cat' => 'Electronics', 'qty' => '15 units'],
            ['title' => 'Shipping Container 40ft', 'cat' => 'Logistics', 'qty' => '2 units'],
            ['title' => 'A4 Paper Reams', 'cat' => 'Office Supplies', 'qty' => '500 reams'],
            ['title' => 'Heavy Duty Crane Rental', 'cat' => 'Machinery', 'qty' => '1 month'],
            ['title' => 'Cement Bags', 'cat' => 'Construction Materials', 'qty' => '1000 bags'],
            ['title' => 'Ergonomic Chairs', 'cat' => 'Furniture', 'qty' => '50 pieces'],
            ['title' => '4K Monitors', 'cat' => 'Electronics', 'qty' => '10 units'],
            ['title' => 'Forklift Purchase', 'cat' => 'Machinery', 'qty' => '1 unit'],
        ];

        $allRfqs = [];
        foreach ($rfqData as $idx => $data) {
            $user = $users[array_rand($users)];
            $catId = $catIds[$data['cat']];
            
            $rfq = new Rfq();
            $rfq->user_id = $user->id;
            $rfq->title = $data['title'];
            $rfq->category_id = $catId;
            $rfq->quantity = $data['qty'];
            $rfq->description = "We are looking for high quality {$data['title']}. Delivery required to Riyadh.";
            $rfq->delivery_date = date('Y-m-d', strtotime('+' . rand(10, 60) . ' days'));
            $rfq->city = ['Riyadh', 'Jeddah', 'Dubai', 'Cairo'][array_rand(['Riyadh', 'Jeddah', 'Dubai', 'Cairo'])];
            $rfq->status = 'OPEN';
            $rfq->created_at = time() - rand(0, 86400 * 10);
            $rfq->updated_at = time();
            
            if ($rfq->save()) {
                $allRfqs[] = $rfq;
            } else {
                 $this->stdout("Error saving RFQ: " . print_r($rfq->errors, true) . "\n", Console::FG_RED);
            }
        }

        // 5. Quotations
        $this->stdout("- Seeding Quotations...\n", Console::FG_YELLOW);
        foreach ($allRfqs as $rfq) {
            // Randomly assign 0-3 quotes per RFQ
            $numQuotes = rand(0, 3);
            if ($numQuotes === 0) continue;

            $shuffledCompanies = $companies;
            shuffle($shuffledCompanies);
            
            for ($k = 0; $k < $numQuotes; $k++) {
                $company = $shuffledCompanies[$k];
                
                $quote = new Quotation();
                $quote->rfq_id = $rfq->id;
                $quote->company_id = $company->id;
                $quote->price_per_unit = rand(50, 5000);
                $quote->total_price = $quote->price_per_unit * (int)$rfq->quantity; // Rough calc
                $quote->delivery_days = rand(5, 30);
                $quote->valid_until = date('Y-m-d', strtotime('+15 days'));
                $quote->notes = "Includes warranty and free shipping.";
                $quote->status = 'PENDING';
                $quote->created_at = time();
                $quote->updated_at = time();
                
                $quote->save();
            }
        }

        $this->stdout("Seeding Complete!\n", Console::FG_GREEN);
    }
}
