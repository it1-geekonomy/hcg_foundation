# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.7.39)
# Database: hcgfoundation_maindb
# Generation Time: 2024-08-08 08:27:03 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table announcements
# ------------------------------------------------------------

DROP TABLE IF EXISTS `announcements`;

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `content` longtext,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;

INSERT INTO `announcements` (`id`, `title`, `slug`, `content`, `created_at`)
VALUES
	(1,'Testing Announcement','testing-annoucenement','Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.','2024-07-25 20:39:57'),
	(2,'Another Announcement','another-announcement','some text conttent for demo purposes only','2024-07-25 21:39:43');

/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table annualreports
# ------------------------------------------------------------

DROP TABLE IF EXISTS `annualreports`;

CREATE TABLE `annualreports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `annual_report_file` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `annualreports` WRITE;
/*!40000 ALTER TABLE `annualreports` DISABLE KEYS */;

INSERT INTO `annualreports` (`id`, `title`, `slug`, `annual_report_file`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(2,'Annual Report 2017 -18','annual-report-2017-18','annual-report-2017--18_66a736228df71.pdf','Annual Report 2017 -18','Annual Report 2017 -18','','2024-07-29 11:56:42'),
	(3,'Annual Report 2018 -19','annual-report-2018-19','annual-report-2018--19_66a736412ca1b.pdf','Annual Report 2018 -19','Annual Report 2018 -19','','2024-07-29 11:57:13'),
	(4,'Annual Report 2019 -20','annual-report-2019-20','annual-report-2019--20_66a7366246cd6.pdf','Annual Report 2019 -20','Annual Report 2019 -20','','2024-07-29 11:57:46'),
	(5,'Annual Report 2020 -21','annual-report-2020-21','annual-report-2020--21_66a736805a9a9.pdf','Annual Report 2020 -21','Annual Report 2020 -21','','2024-07-29 11:58:16'),
	(6,'Annual Report 2021 -22','annual-report-2021-22','annual-report-2021--22_66a7369a165ca.pdf','Annual Report 2021 -22','Annual Report 2021 -22','','2024-07-29 11:58:42'),
	(7,'Annual Report 2022-23','annual-report-2022-23','annual-report-2022-23_66a736b4887d9.pdf','Annual Report 2022-23','Annual Report 2022-23','','2024-07-29 11:59:08'),
	(8,'Annual Report 2023-24','annual-report-2023-24','annual-report-fy-2023-24_66a736d08d1bd.pdf','Annual Report 2023-24','Annual Report 2023-24','','2024-07-29 11:59:36');

/*!40000 ALTER TABLE `annualreports` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table blogs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `blogs`;

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `blog_banner` varchar(255) DEFAULT NULL,
  `blog_mobile_banner` varchar(255) DEFAULT NULL,
  `blog_date` varchar(255) DEFAULT NULL,
  `author_name` varchar(255) DEFAULT NULL,
  `author_designation` varchar(255) DEFAULT NULL,
  `content` longtext,
  `short_description` text,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `blogs` WRITE;
/*!40000 ALTER TABLE `blogs` DISABLE KEYS */;

INSERT INTO `blogs` (`id`, `title`, `slug`, `blog_banner`, `blog_mobile_banner`, `blog_date`, `author_name`, `author_designation`, `content`, `short_description`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(2,'How to Prevent Oral Cancer','how-to-prevent-oral-cancer','oral-cancer-banner_66a23bd84e901.jpg','oral-cancer-mobile-banner_66a23bd84ed93.jpg','Thursday, 25 July, 2024','HCG Foundation','K.R Road - Bangalore','<p>Oral cancer is a serious health concern that affects millions worldwide. While there\'s no guaranteed way to prevent it, adopting healthy lifestyle habits can significantly reduce your risk. HCG Foundation is committed to raising awareness about oral cancer and empowering you to take control of your oral health.</p>\r\n<h2>Understanding Oral Cancer</h2>\r\n<p>Oral cancer refers to cancer that develops in any part of the mouth, including the lips, tongue, cheeks, floor of the mouth, roof of the mouth, gums, and tonsils. It can affect anyone, but certain factors increase your risk.</p>\r\n<h2>Key Prevention Strategies</h2>\r\n<ul>\r\n<li><strong>Quit Smoking and Chewing Tobacco:</strong> Tobacco use is the primary risk factor for oral cancer. Quitting is the most effective way to reduce your risk.</li>\r\n<li><strong>Limit Alcohol Consumption:</strong> Excessive alcohol consumption, especially when combined with tobacco use, increases the risk of oral cancer.</li>\r\n<li><strong>Protect Yourself from the Sun:</strong> Overexposure to the sun can lead to lip cancer. Use lip balm with SPF and avoid prolonged sun exposure.</li>\r\n<li><strong>Maintain Good Oral Hygiene:</strong> Regular brushing, flossing, and dental check-ups help detect early signs of oral cancer.</li>\r\n<li><strong>Eat a Healthy Diet:</strong> A diet rich in fruits, vegetables, and whole grains can contribute to overall health, including oral health.</li>\r\n<li><strong>Get Vaccinated Against HPV:</strong> The human papillomavirus (HPV) is linked to certain types of oral cancer. The HPV vaccine can protect against it.</li>\r\n<li><strong>Regular Self-Exams:</strong> Familiarize yourself with the appearance of your mouth and look for any changes, such as sores, lumps, or white or red patches.</li>\r\n</ul>\r\n<h2>Early Detection Saves Lives</h2>\r\n<p>Early detection is crucial in the fight against oral cancer. If you notice any changes in your mouth, such as persistent sores, difficulty swallowing, or unexplained bleeding, consult a dentist or doctor immediately.</p>\r\n<p>Remember, prevention is the best medicine. By adopting these healthy habits and undergoing regular oral examinations, you can significantly reduce your risk of oral cancer.</p>\r\n<p>HCG Foundation is dedicated to supporting individuals affected by oral cancer and promoting prevention efforts. For more information or to get involved, please visit our website or contact us.</p>\r\n<h2>Conclusion</h2>\r\n<p>By understanding the risk factors and implementing preventive measures, you can significantly reduce your chances of developing oral cancer. Remember, early detection is key to successful treatment. Make oral health a priority by scheduling regular dental check-ups and performing self-exams.</p>\r\n<p>HCG Foundation is committed to supporting individuals affected by oral cancer and funding vital research. Your contribution can make a difference in the lives of countless people. Join us in the fight against oral cancer by donating today.</p>','Oral cancer is a serious health concern that affects millions worldwide. While there\'s no guaranteed way to prevent it, adopting healthy lifestyle habits can significantly reduce your risk. HCG Foundation is committed to raising awareness about oral cancer and empowering you to take control of your oral health.','How to Prevent Oral Cancer - HCG Foundation','Oral cancer is a serious health concern that affects millions worldwide. While there\'s no guaranteed way to prevent it, adopting healthy lifestyle habits can significantly reduce your risk. HCG Foundation is committed to raising awareness about oral cancer and empowering you to take control of your oral health.','','2024-07-25 17:19:44');

/*!40000 ALTER TABLE `blogs` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table events
# ------------------------------------------------------------

DROP TABLE IF EXISTS `events`;

CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `event_banner` varchar(255) DEFAULT NULL,
  `event_mobile_banner` varchar(255) DEFAULT NULL,
  `event_date` varchar(255) DEFAULT NULL,
  `event_location` varchar(255) DEFAULT NULL,
  `event_time` varchar(255) DEFAULT NULL,
  `content` longtext,
  `short_description` text,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;

INSERT INTO `events` (`id`, `title`, `slug`, `event_banner`, `event_mobile_banner`, `event_date`, `event_location`, `event_time`, `content`, `short_description`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(1,'Testing Event','testing-event','event-image-sample_66a890b978c04.jpeg','event-image-sample_66a890b9791ba.jpeg','2024-09-19','Bangalore','40:30 PM','<p>some content for event page</p>','<p>event short description</p>','testing evemt','testing evemt','','2024-07-25 18:31:17'),
	(2,'Past Event Name','past-event-name','event-image-sample_66a892cac8116.jpeg','event-image-sample_66a892cac8277.jpeg','2024-07-16','Chennai','04:30 PM','<p>This is a past event</p>','<p>Past Event Content short</p>','Past Event','Past Event','','2024-07-25 19:53:34'),
	(3,'Futur Event','future-event','event-image-sample_66a89263021a0.jpeg','event-image-sample_66a8926302318.jpeg','2024-07-31','Bangalore','04:40 PM','<p>Some content&nbsp;</p>','<p>some content</p>','Future','future','','2024-07-26 11:06:52');

/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table leads_contact
# ------------------------------------------------------------

DROP TABLE IF EXISTS `leads_contact`;

CREATE TABLE `leads_contact` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text,
  `report` varchar(255) DEFAULT NULL,
  `form_name` varchar(255) DEFAULT NULL,
  `form_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `leads_contact` WRITE;
/*!40000 ALTER TABLE `leads_contact` DISABLE KEYS */;

INSERT INTO `leads_contact` (`id`, `full_name`, `phone`, `email`, `department`, `subject`, `message`, `report`, `form_name`, `form_url`, `created_at`)
VALUES
	(1,'','','',NULL,NULL,'',NULL,'Contact Page Form','http://localhost/hcgfoundationnew/contact-us','2024-08-07 10:55:00'),
	(2,'','','',NULL,NULL,'',NULL,'Contact Page Form','http://localhost/hcgfoundationnew/contact-us','2024-08-07 11:26:25'),
	(3,'','','',NULL,NULL,'',NULL,'Contact Page Form','http://localhost/hcgfoundationnew/contact-us','2024-08-07 11:57:53'),
	(4,'Shiva testing','9999999999','shiva@gmail.com',NULL,NULL,'Testing, please ignore',NULL,'Contact Page Form','http://localhost/hcgfoundationnew/contact-us','2024-08-07 12:01:21'),
	(5,'Shiva testing','9999999999','shiva@gmail.com',NULL,NULL,'Testing, please ignore',NULL,'Contact Page Form','http://localhost/hcgfoundationnew/contact-us','2024-08-07 12:03:37');

/*!40000 ALTER TABLE `leads_contact` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table news
# ------------------------------------------------------------

DROP TABLE IF EXISTS `news`;

CREATE TABLE `news` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `news_banner` varchar(255) DEFAULT NULL,
  `news_mobile_banner` varchar(255) DEFAULT NULL,
  `news_date` varchar(255) DEFAULT NULL,
  `content` longtext,
  `short_description` text,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;

INSERT INTO `news` (`id`, `title`, `slug`, `news_banner`, `news_mobile_banner`, `news_date`, `content`, `short_description`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(1,'Testing News','testing-news','event-image-sample_66a8bdf94b3f3.jpeg','event-image-sample_66a8bdf94b5ab.jpeg','Wednesday, 31 July, 2024','<p>News Content here</p>','<p>News Short Description</p>','Testing News','Testing News','','2024-07-30 15:48:33'),
	(2,'News Titlte 2','news-title-2','event-image-sample_66a8beb215445.jpeg','event-image-sample_66a8beb215595.jpeg','Tuesday, 30 July, 2024','<p>Tesgin content 2</p>','Testing short description','News titke','news titel','','2024-07-30 15:51:38');

/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table pages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pages`;

CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `page_banner` varchar(255) DEFAULT NULL,
  `content` longtext,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;

INSERT INTO `pages` (`id`, `title`, `slug`, `page_banner`, `content`, `meta_title`, `meta_description`, `schema_code`, `created_at`, `updated_at`)
VALUES
	(2,'Privacy Policy','privacy-policy',NULL,'<p>We take personal information about you when you donate, enter a request, sign up to our information sheet, register your interest as a potential volunteer, and register your interest as a potential intern. The data we gather consist of your name, address, e-mail as well as phone numbers. This personal information is not distributed, shared, rented or given to companies or organizations that are not part of the HCG Foundation. The information collected enables HCG Foundation to provide and improve its services to you such as processing donations, providing receipts, sending information, and providing new opportunities for you to assist financially challenged cancer patients.</p>\r\n<p>We usually update our followers by email. If you think you are being contacted frequently, please inform us and we can limit this to fewer updates or if you would prefer, take you out from the e-mailing list completely.</p>\r\n<p>You can also request a copy of the personal info we have for you at any time by emailing <a href=\"mailto:hcgfoundation@gmail.com\">hcgfoundation@gmail.com</a> If any personal information changes or you find our records are not up to date, please inform us.</p>\r\n<p>We will make sure your personal information is held safely, as per the Data Protection Act.</p>','Privacy Policy','HCG Foundation Privacy Policy','','2024-07-21 13:05:17','2024-07-21 13:05:17'),
	(3,'Terms and Conditions','terms-and-conditions',NULL,'<p><strong>Dear Donor,</strong></p>\r\n<p>By clicking on the check box, it is assumed that the &ldquo;Payment Terms and Conditions&rdquo; have been read and understood by you and you accept the same.</p>\r\n<ul class=\"hcg-list\">\r\n<li>If your donation transaction is successful, you receive an email acknowledgment of the same with a receipt number. If you provide your PAN or Adhar details, you can download the 80G receipt from our website or send a request to <a href=\"mailto:hcgfoundation@gmail.com\">hcgfoundation@gmail.com</a>. If you don&rsquo;t want to provide your PAN or Adhar details, you can download a normal receipt from our website or send a request to <a href=\"mailto:hcgfoundation@gmail.com\">hcgfoundation@gmail.com</a></li>\r\n<li>Refunds are not permitted. Please ensure you fill up the donation amount with due care, and verify all fields before proceeding for payment.</li>\r\n<li>We accept all Visa, Master &amp; Maestro cards, Indian and International. Note that debit cards will work only if you have activated net banking for your account.</li>\r\n<li>Credit / Debit card information is provided by you only on the secure payment gateway and we (HCG Foundation) do not collect this information.</li>\r\n<li>You undertake to provide the correct and valid credit card details and confirm that you shall not use any credit card that is not lawfully owned by you.</li>\r\n</ul>','Terms and Conditions - HCG Foundation','Terms and Conditions - HCG Foundation','','2024-07-21 13:09:58','2024-07-21 13:09:58');

/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table patientstories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `patientstories`;

CREATE TABLE `patientstories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `patient_image` varchar(255) DEFAULT NULL,
  `story_date` varchar(255) DEFAULT NULL,
  `donation_state` varchar(250) DEFAULT NULL,
  `content` longtext,
  `short_description` text,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `patientstories` WRITE;
/*!40000 ALTER TABLE `patientstories` DISABLE KEYS */;

INSERT INTO `patientstories` (`id`, `title`, `slug`, `patient_image`, `story_date`, `donation_state`, `content`, `short_description`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(1,'Rathna Kumari','rathna-kumari','ratna-kumari_66a8a6e462d15.jpg','Wednesday, 1 April, 2020','Inactive','<h2>About Rathna Kumari</h2>\r\n<p>Rathna Kumari is 51 years old and is a mother of 2 daughters and a son. She is from Chennai. Her husband, Mastanaiah, works as a laborer in an iron factory with earnings of 12,000/- month. She has led a very difficult life for a mother, as both of her daughters became polio victims at the age of 6. They both are bedridden and require their parents&rsquo; support for their basic daily activities. Her son was not interested in studies and left school after the 10th grade. He works in garments sector where he gets paid according to his work. They live in a house sponsored by the Government.</p>\r\n<p>Rathna Kumari spends most of her time by taking care of her 2 daughters and reading the holy book. She says her happiest moments are on her children&rsquo;s birthday. She doesn&rsquo;t go outside since her daughters depend on her for support and for continuous medication else they will be affected with seizures. They are taking treatment at NIMHANS hospital.</p>\r\n<h2>Medical Details</h2>\r\n<p>In January 2015 she started feeling pain in her right breast and found a small lump. She visited a local clinic where the doctor recommended her to visit any hospital. Her neighbor suggested her to visit SK Hospital, where she was told to get a biopsy and tests from Karma lab. The results showed the presence of cancer cells. The SK hospital doctors explained the line of treatment and estimated cost for each treatment and/or test. Since they didn&rsquo;t have enough money for the treatment, her husband asked the opinion of the factory owner where he worked at.</p>\r\n<p>He advised them to take treatment in HCG Hospital, so Mastanaiah came with all the reports to HCG Hospital and met Dr. Shekar Patil who went through all the old reports and insisted her to undergo certain more test to confirm the line of treatment. The initially treatment started with the surgery to remove the lump, followed by 12 cycles of chemotherapy in day care and finally complete treatment with radiation. After the course of treatment, the doctor prescribed a tablet to take for 7 years along with annual check ups.</p>\r\n<p>Rathna Kumari continued with the treatment course by following up for 3 years and after that she stopped because she couldn&rsquo;t leave her daughters due to their health condition. After a few years there arouse a doubt whether there is a reoccurrence due to the lump coming back on her right breast.</p>\r\n<h2>Recent Updates</h2>\r\n<p>Rathnakumari has successfully completed her treatment and is on regular medication. She is glad to be back home with her family.</p>','<p>Rathna Kumari is 51 years old and is a mother of 2 daughters and a son. She is from Chennai. Rathna spends most of her time by taking care of her 2 daughters and reading the holy book.</p>','Rathna Kumari','Rathna Kumari','','2024-07-30 14:10:04'),
	(2,'Ayan Syed','ayan-syed','ayan-syed-image_66a9f614b505c.jpg','Wednesday, 1 April, 2020','Inactive','<h2>About Ayan Syed</h2>\r\n<p>Ayan Syed is a 6-year-old energetic child who loves spending time with his family. His parents work in HCG Hospital (Bangalore), his father is a Parking Guard and his mother is a Security Guard. According to his parents he is very happy when, &lsquo;Chicken&rsquo; &ndash; is prepared at home; as it is his favourite food.</p>\r\n<p>Ayan is a very smart child who loves studying and taking part in sports. He has also won &ndash; 1st Prize (LKG), at his School&rsquo;s Sports Event. Besides studying and sports; Ayan enjoys going out and likes posing for pictures. Apart from this, he is very close to his maternal grandmother and she cherishes the time spent with him.</p>\r\n<h2>Medical Details</h2>\r\n<p>When Ayan was studying in LKG, he used to get periodic-high-fever and though he was on antibiotics the fever wouldn&rsquo;t subside. Ayan was under the care of his grandmother for 2-months; as his mother was hospitalised due to complications in her second pregnancy. In a span of 2-months the child lost weight and his skin had turned yellow. After been taken to various clinics and government hospitals in Kolkata, despite the blood-tests; there were no improvements and they couldn&rsquo;t identify the cause of his sickness.</p>\r\n<p>A CT scan and some tests in another government hospital revealed the presence of a tumour in his stomach next to the liver. A surgery was conducted after 6 months of diagnosis, but unfortunately it was unsuccessful. The disease had spread to the entire liver and the biopsy confirmed it was cancer. A month after his surgery tests showed the presence of a tumour in the surgery area. The doctors conducted an additional surgery but the tumour surfaced again after a weeks&rsquo; time.</p>\r\n<p>Ayan was taken for treatment to Ambedkar Hospital in Bangalore and later to KIDWAI, where he was diagnosed with Embryonal&ndash;Rhabdomyosarcoma (ERMS).The doctors explained the line of treatment; a total time frame of 14 months and the estimation of the treatment {Chemotherapy + Radiation + Surgery}.He was taken to HCG hospital for a second opinion from Dr. Raghavendra. Ayan underwent surgery 3 more times but there seemed to be no progress as the cancer had spread to the entire liver. The only solution was to remove the infected portion of the liver. A decision was taken to wait until Ayan was 11 years and continue the treatment with radiation followed by medication and follow up every 6-months.</p>\r\n<h2>Recent Update</h2>\r\n<p>Ayan Syed has completed his treatment and is back home with his family. He loves spending time especially with his grandmother. He is yet to undergo a surgery to remove the residual tumor, this will be done once he is older.</p>','<p>Ayan Syed is a 6-year-old energetic child who loves spending time with his family. Ayan is a very smart child who loves studying and taking part in sports.</p>','Ayan Syed','Ayan Syed is a 6-year-old energetic child who loves spending time with his family. Ayan is a very smart child who loves studying and taking part in sports.','','2024-07-31 14:00:12'),
	(3,'Sharanya','sharanya','sharanya-image_66a9f6e3a909b.jpg','Wednesday, 1 April, 2020',NULL,'<h2>About Sharanya</h2>\r\n<p>Sharanya is a 12-year-old girl studying her 6th standard at Aiyyappa Government School in Bangalore. She was born and raised in Tamil Nadu, but moved to Bangalore since her father, Mr. Tony, works as an office assistant in a company in Bangalore. Her older brother goes to the same school as her and is in 8th standard. She has an elder brother who goes to the same school at 8th standard. She successfully completed her 6th standard and was unfortunately unable to continue into her 7th grade due to her illness. She is disappointed that she couldn&rsquo;t continue on with her friends and deeply misses them along with her teachers. She is very good at sports, especially running, and participated in many athletic activities at School. Her favorite hobby is drawing which she indulges in most of the time. She really enjoys drawling and expresses that it makes her so happy that she forgets her pain. Her dream is to become a doctor were she can help people who are suffering from various diseases.</p>\r\n<p>Sharanya&rsquo;s father is the only breadwinner for the family and earns 15000 rupees per month. Sharanya&rsquo;s mother is a homemaker. They live in a rented house in Bangalore. He struggles to make ends meet and usually runs out of money by the end of the month. Since his monthly income is used for maintaining the household, rent, and children education, he has no savings. The parents want the best education for their children, so they can have better jobs and lead a better life. Sharanya&rsquo;s mother is always in tears, as she cannot see her little girl in pain.</p>\r\n<h2>Medical Details</h2>\r\n<p>Sharanya was diagnosed with Acute Lymphoblastic leukemia (ALL) ten months ago, which was during her first week of 7th standard. Initially she started vomiting whatever she ate and her parents took her to a local clinic near their house. After initial examination the doctor prescribed tablets for indigestion with side effects of loose stools. She continued to be ill and parents took her to another clinic. There she underwent an USG (ultrasound) and her report detected cancer lumps in her stomach.</p>\r\n<p>Later she was taken to &ldquo;SEVEN DAYS&rdquo; hospital and the examining doctor suggested she should go to Kidwai Hospital for cancer treatment. One of her father&rsquo;s contacts told she should consult with Dr. Intezar from HCG Hospital, Bangalore. Finally in HCG Hospital she has undergone certain cycles of chemotherapy. In January 2020 she completed her chemotherapy and will be visiting the hospital for follow up care during this year.</p>\r\n<h2>Recent Update</h2>\r\n<p>Sharanya has successfully completed her treatment and is back home. She has started her online classes for 7th Grade.</p>','Sharanya is a 12-year-old girl studying her 6th standard at Aiyyappa Government School in Bangalore. She was born and raised in Tamil Nadu.','','','','2024-07-31 14:03:39'),
	(4,'Sarojamma','sarojamma','sarojamma-image_66a9f77d04638.jpg','Thursday, 2 April, 2020','NA','<h2>About Sarojamma</h2>\r\n<p>Sarojamma, a 75-year-old hardworking woman, sells flowers near Sai Baba Temple in Indiranagar. She has devoted her life to god and to her family. She is blessed with three sons, a daughter, eight grandchildren and two great grandchildren. Sarojamma&rsquo;s husband was also a flower seller but due to a urological medical condition he is bedridden. She and her husband stay with their youngest son who helps her get flowers to sell. Sarojamma&rsquo;s other two sons are working as drivers and their daughter is married.</p>\r\n<p>Sarojamma is very independent &ndash; that on her own she was able to get her grandchildren married; with her own hard earned money and presently is very happy to see 2 great grandchildren. Even at this age she wants to work and earn for herself and her family.</p>\r\n<h2>Medical Details</h2>\r\n<p>Initially she had a severe stomach ache with continuous flow of white discharge. She consulted a gynaecologist at Cambridge hospital, where she was examined and was diagnosed with the initial stages of cancer. She was referred to KIDWAI hospital where she underwent tests, 25 days of radiation and biopsy. During her treatment she had severe Diarrhea and white discharge and decided to stop the treatment at KIDWAI hospital because she couldn&rsquo;t bare the pain.</p>\r\n<p>Everything was fine and she returned to her normal routine, but one day she felt a sensation of a bubble bursting inside her stomach followed by vaginal bleeding. She consulted the same doctor in Cambridge hospital, on examination the doctor informed that the cancer had spread and she had to restart the treatment immediately. After that she came to HCG Hospital and took the opinion of a medical oncologist and a surgical oncologist. The doctors suggested surgery and 3 cycles of chemotherapy.</p>\r\n<p>As per the Doctors&rsquo; instructions she underwent surgery for stenting and currently she is receiving chemotherapy treatment.</p>\r\n<h2>Recent Update</h2>\r\n<p>Sarojamma has successfully completed her surgery and chemotherpay. She is doing well and has gone back to work, that is selling flowers.</p>','<p>Sarojamma, a 75-year-old hardworking woman, sells flowers near Sai Baba Temple in Indiranagar. She is blessed with three sons, a daughter, eight grandchildren and two great grandchildren.</p>','Sarojamma','Sarojamma','','2024-07-31 14:06:13'),
	(5,'Ammar Ahmed','ammar-ahmed','ammar-iamge_66a9f7e160441.jpg','Thursday, 2 April, 2020','NA','<h2>About Ammar</h2>\r\n<p>Ammar is a child who enjoys playing with his toys and is &ldquo;The Apple of my Eye&rdquo;, to both his mother and his father. This toddler is all of 2 years, very active and enthusiastic.</p>\r\n<p>He loves spending time with his family, by going out to the park along with his parents and his elder brother. A family of four hailing from Udupi and having settled in Saudi Arabia, his life is already filled with beautiful experiences. Now the family currently resides in Bangalore.</p>\r\n<h2>Medical Details</h2>\r\n<p>Ammar&rsquo;s symptoms started with persistent fever. The parents consulted a pediatrician in Saudi who suggested that the child be admitted in hospital for few days. Even after hospitalisation the fever didn&rsquo;t subside. After certain tests the child was diagnosed with leukaemia on 14th July 2019.</p>\r\n<p>The family flew down to India for his treatment and consulted Dr.Intezar Mehdi at HCG and understood the line of treatment. After MRI scan and blood tests, 5 cycles of chemotherapy was suggested. On 27 Jan 2020 Ammar has completed his chemotherapy and is on road to recovery .He is been advised maintenance chemotherapy for 2 years.</p>\r\n<p><strong>Case :</strong> Acute lymphoblastic leukaemia is the most common childhood cancer. It occurs when a bone marrow cell develops errors in its DNA. Symptoms may include enlarged lymph nodes, bruising, fever, bone pain, bleeding from the gums and frequent infections.</p>\r\n<p>The estimation for 5 cycles of chemotherapy was; 15-Lakhs. They have already spent around; 13-Lakhs for both chemotherapy and supportive care.</p>\r\n<h2>Recent Update</h2>\r\n<p>The family required financial aid for maintenance chemotherapy for 2 years: 1.25 lakhs. With the support from HCG Foundation and other donors Ammar completed his chemotherapy and went back to his hometown Mangalore.</p>','<p>Ammar is a child who enjoys playing with his toys and is &ldquo;The Apple of my Eye&rdquo;, to both his mother and his father. This toddler is all of 2 years, very active and enthusiastic.</p>','Ammar Ahmed','Ammar Ahmed','','2024-07-31 14:07:53'),
	(6,'Venkatesh V','venkatesh-v','venkatesh-image_66b1fd71b3d3b.jpg','Thursday, 2 April, 2020','Inactive','<h2>About Venkatesh</h2>\r\n<p>Venkatesh. V, is 49-years old and currently resides in JP Nagar, along with his wife Shantha. When he was 9 years old, Venkatesh lost his father due to Diabetes; the shock of losing her beloved husband was so devastating that, a few days later even his mother passed away. Leaving the children behind with a huge responsibility of paying back a family loan! Venkatesh began working a short while after in his relative&rsquo;s house till he was able to finish his 10th grade. Further to completing his 10th, he started working at Prakash Road Lines, as an office assistant, which he had to give up eventually because of personal commitments. In 1997, he was married off to Shantha, from a struggling lower-caste family and has been married ever since.</p>\r\n<p>The couple have no children; Venkatesh and Shantha are currently taking care of their relatives. Despite suffering from diabetes, high blood-pressure and thyroid; Shantha spends most of her time looking after an elder lady in the house, while Venkatesh manages small errands for the family in exchange for food and shelter.</p>\r\n<p>Venkatesh and Shantha dream of one day having their own home and a good meal amidst all of the situations they face.</p>\r\n<h2>Medical Details</h2>\r\n<p>In 2001, the patient vomited blood and also noticed blood in the sputum. He consulted a physician who advised certain tests along with a CBC. The results showed that he had CML cancer. Post which the patient was referred to KIDWAI. After the initial consultation at KIDWAI, there was a delay in carrying out the treatment. The concerned family, who were aware of HCG consulted Dr. Ravi Diwakar. Dr. Diwakar did a thorough analysis and suggested specific lab tests and procedures. Based on the test results the patient was put under medication.</p>\r\n<p>From 2005 the patient&rsquo;s condition has improved vastly and is on a bi-monthly check up plan.</p>\r\n<h2>Recent Update</h2>\r\n<p>Venkatesh, has successfully completed his treatment and is on his follow-up consultation. This was possible by the means of your contributions and support from HCG Foundation.</p>','<p>Venkatesh.V is 49-years old and currently resides in JP Nagar, along with his wife Shantha. When he was 9 years old, Venkatesh lost his father due to Diabetes.</p>','Venkatesh V','Venkatesh.V is 49-years old and currently resides in JP Nagar, along with his wife Shantha. When he was 9 years old, Venkatesh lost his father due to Diabetes.','','2024-08-06 16:09:45'),
	(7,'Prajwal','prajwal','prajwal_66b1fe1d0d009.png','Monday, 27 July, 2020','Inactive','<h2>About Prajwal</h2>\r\n<p>Prajwal is part of a family of four that resides in Bangalore, he is currently studying in a school near KR Puram along with his younger brother. His father is a contractor who provides labour for construction sites, while his mother is a home maker.</p>\r\n<p>He is currently in 4th std and is very studious and one day hopes to be an engineer. During his free time Prajwal loves playing cricket with his friends and spending time with family, especially his younger brother who he is very fond of.</p>\r\n<h2>Medical Details</h2>\r\n<p>In August 2019 last year his parents noticed that he was beginning to lose interest in everything he did. Prajwal had begun complaining about a repeated pain in his stomach, this made it hard for him to concentrate on studying and the reason for him showing a lack of interest in daily activities. Concerned about his well-being, his parents decided to get an MRI Scan done at Clumax Hospital, post which the Doctor advised them to go to Philomena Hospital.</p>\r\n<p>The presence of Wilm&rsquo;s tumor was confirmed post which they approached HCG Hospital where he began his treatment, after a thorough analysis of his report. The family was informed about the procedure &ndash; requiring Prajwal to undergo chemotherapy for 6-weeks along with surgery and has been advised to undergo further radiation treatment.</p>\r\n<h2>Recent Update</h2>\r\n<p>Prajwal, has successfully completed his treatment and is on his follow-up consultation. This was possible by the means of your contributions and support from HCG Foundation.</p>','<p>Prajwal is part of a family of four that resides in Bangalore, he is currently studying in a school near KR Puram along with his younger brother.</p>','Prajwal','Prajwal is part of a family of four that resides in Bangalore, he is currently studying in a school near KR Puram along with his younger brother.','','2024-08-06 16:12:37'),
	(8,'Jatin','jatin','jatin-image_66b1fe9812c73.jpg','Monday, 3 August, 2020','Inactive','<h2>About Jatin</h2>\r\n<p>Jatin is a 3-year old boy who stays in a joint family in Rajasthan. His father Manish, works at a hardware store as a service technician, while his mother is a homemaker. Jatin is a very active child who loves reading, studying and playing with his cousins at home.</p>\r\n<h2>Medical Details</h2>\r\n<p>In June 2020, on a sunny day while Jatin was playing outside his grandfather&rsquo;s house in Bangalore; his grandfather noticed that Jatin&rsquo;s body had turned yellow. The family immediately took him to Shanbhag Hospital where he underwent a blood test, X-ray and MRI scan. After going through the reports doctor referred them to Ramaiah hospital for further diagnosis.</p>\r\n<p>At Ramaiah in HCG Oncology division, Jatin underwent the following tests: &ndash; Blood Test and a PET-CT scan. Post test results, he was diagnosed with Acute-Lymphoblastic-Leukemia for which the doctors advised that he has to undergo chemotherapy for a period of 2 to 3 months.</p>\r\n<h2>Recent Update</h2>\r\n<p>Jatin, has successfully completed his treatment and is on his follow-up consultation. This was possible by the means of your contributions and support from HCG Foundation.</p>','Jatin is a 3-year old boy who stays in a joint family in Rajasthan. His father Manish, works at a hardware store as a service technician, while his mother is a homemaker.','Jatin','Jatin is a 3-year old boy who stays in a joint family in Rajasthan. His father Manish, works at a hardware store as a service technician, while his mother is a homemaker.','','2024-08-06 16:14:40'),
	(9,'Kamala','kamala','kamala-image_66b2006eae6b2.png','Monday, 17 August, 2020','Inactive','<h2>About Kamala</h2>\r\n<p>Kamala is 60-years old, currently residing in Sonnenahalli, Bangalore South; with her sister and grand-daughter. The family originally hails from Tamil-Nadu. Kamala used to work as a housekeeper and had decided not to get married as she wanted to take care of her parents.</p>\r\n<h2>Medical Details</h2>\r\n<p>Last year during a relatives wedding Kamala had an accident in the kitchen that hurt her breast region, which created a blood clot. She began experiencing pain on and off, although the pain had reduced, the blood clot grew into a lump over time. On June 7th- 2020, while she was sleeping the lump opened up and began bleeding.</p>\r\n<p>Her family immediately took her to Amar Jyothi Hospital, where she underwent a Mammogram, X-Ray and a Blood test.</p>\r\n<p>On seeing the reports the doctor informed that she has breast cancer and has to undergo immediate surgery.After a week Kamala underwent surgery to remove the tumour. She was referred for chemotherapy at HCG Hospital, where Dr. Vinayak informed her to undergo 4 cycles of chemotherapy. At present she has completed one cycle of chemotherapy and is yet to complete all her sessions.</p>\r\n<h2>Recent Update</h2>\r\n<p>Kamala has successfully completed her treatment and is on her follow-up consultation. This was possible by the means of your contributions and support from HCG Foundation.</p>','Kamala is 60-years old, currently residing in Sonnenahalli, Bangalore South; with her sister and grand-daughter. The family originally hails from Tamil-Nadu.','Kamala','Kamala is 60-years old, currently residing in Sonnenahalli, Bangalore South; with her sister and grand-daughter. The family originally hails from Tamil-Nadu.','','2024-08-06 16:22:30'),
	(10,'Aisha','kisha','aisha-image_66b2010ac9f9c.jpg','Thursday, 20 August, 2020','Inactive','<h2>About Aisha</h2>\r\n<p>Aisha is a 7-year old girl and is the oldest of two siblings a 3-year old brother and a 3-month old sister, in a household of five members. The family hails from Sirsi, where her father is a farmer and mother a home-maker. Aisha is an enthusiastic child who loves playing sports and participating in dance competitions at her school.</p>\r\n<h2>Medical Details</h2>\r\n<p>In 2019, during her summer vacation Aisha started complaining about a pain in her leg, for which they consulted a physician who prescribed medication for the same. However, after a few days while she was playing she experienced the pain again and it didn&rsquo;t subside.</p>\r\n<p>Concerned about her situation the family took her to TSS Hospital in Sirsi where she underwent a MRI Scan, the report showed the presence of cancer (Ewing Sarcoma). Based on the report, the doctors in Sirsi advised the family that she undergo treatment at KMC Hospital Mangalore. At KMC Hospital, post consultation and understanding the line of treatment, Aisha underwent 9-cycles of chemotherapy and later a Limb Salvage surgery at HCG Hospital.</p>\r\n<h2>Recent Update</h2>\r\n<p>Aisha has completed her surgery at HCG Hospital, under the supervision of Pediatric Oncologist Dr.Pramod. She is currently undergoing her chemotherapy at a hospital in Mangalore and is responding very well to the treatment.</p>','Aisha is a 7-year old girl and is the oldest of two siblings a 3-year old brother and a 3-month old sister, in a household of five members.','Aisha','Aisha is a 7-year old girl and is the oldest of two siblings a 3-year old brother and a 3-month old sister, in a household of five members.','','2024-08-06 16:25:06'),
	(11,'Ankita Basavaraj','ankita-basavaraj','ankita-bharadwaj-image_66b201917fcea.png','Thursday, 20 August, 2020','Inactive','<h2>About Ankita</h2>\r\n<p>Ankita is a 16-year old teenager who lives with her family in Belgaum,Karnataka. She is the eldest out of the four children, two brothers and a younger sister who all study in Cambridge School, Belgaum. Her father is a farmer, while the mother takes care of the house.</p>\r\n<p>At home, Ankita spends time with her siblings discussing various topics, interests and sharing stories. She loves practicing handwriting and studying science, with the aspiration to become a doctor one day to help people in need.</p>\r\n<h2>Medical Details</h2>\r\n<p>On 18th May 2018, Ankita started having recurring cases of fever, which despite her initial treatment at Alva&rsquo;s Hospital, Moodabidri; hadn&rsquo;t subsided. She was brought back to Belgaum where she diagnosed with acute lymphoblastic leukemia, post a blood test from a hospital.</p>\r\n<p>Moving ahead she was referred to HCG Hospital, where she began her course of chemotherapy and finished her maintenance chemotherapy session by 2019. During this period she developed a slight problem in her legs, making it hard for her to walk; for which she has been coming in for follow-up tests and treatment.</p>\r\n<h2>Recent Update</h2>\r\n<p>Ankita has completed her chemotherapy at HCG Hospital and is currently with her family in Belgaum. She has been going in for her follow up treatment under the supervision of Pediatric Oncologist Dr.Pramod.</p>','Ankita is a 16-year old teenager who lives with her family in Belgaum,Karnataka. She is the eldest out of the four children,','Ankita Basavaraj','Ankita is a 16-year old teenager who lives with her family in Belgaum,Karnataka. She is the eldest out of the four children,','','2024-08-06 16:27:21'),
	(12,'Anvitha','anvitha','anvitha-image_66b201fcf1b10.jpg','Thursday, 20 August, 2020','Inactive','<h2>About Anvitha</h2>\r\n<p>Anvitha is the only child and is treated as a princess in her family. The family resides in Bangalore, where her father is an engineer for a construction company and her mother, a homemaker. Being all of 2 years she loves spending time with her parents and occasionally plays with her toys and watches cartoons on TV.</p>\r\n<h2>Medical Details</h2>\r\n<p>Being an active toddler, Anvitha started to complain of stomach pain and developed fever. Her parents noticed that there was a slight swelling in the abdomen region. They immediately took her to a paediatrician who suggested: &ndash; Ultrasound Scan and CBC, post the tests Anvitha was diagnosed with Neuroblastoma Stage 4.The doctor advised, that she be treated at a specialised cancer hospital. A family friend suggested HCG Hospital, where they consulted with Dr.Intezar.</p>\r\n<p>She has undergone 4 types of treatment, that is; 8 cycles of chemotherapy, as continuation of treatment at a later stage she underwent surgery, BMT and radiation to stop the growth of cancer cells. She is now better, showing a great response in terms of recovery and is on her follow up consultation.</p>\r\n<h2>Recent Update</h2>\r\n<p>Anvitha has completed her maintenance chemotherapy at HCG Hospital and has completely recovered, she is currently on her follow up sessions under the supervision of Pediatric Oncologist Dr.Intezar.</p>','<p>Anvitha is the only child and is treated as a princess in her family. The family resides in Bangalore,</p>','Anvitha','Anvitha is the only child and is treated as a princess in her family. The family resides in Bangalore,','','2024-08-06 16:28:52'),
	(13,'Arpith','arpith','arpith-image_66b202b9e401f.jpg','Thursday, 20 August, 2020','Inactive','<h2>About Arpith</h2>\r\n<p>Arpith is a 14-year old boy studying in 10th std in a government and is very intelligent when it comes to his studies. He stays in a family of five, his father is a security guard and mother a home maker. He has an elder sister and a brother. He loves dancing and has performed in a couple of shows in Mangalore. He aspires to get a job in the banking sector, after his education.</p>\r\n<h2>Medical Details</h2>\r\n<p>In October 2018, Arpith noticed a small lump near his right knee. The family consulted an orthopaedic near their home, post the tests the X-Ray showed the presence of a small tumour in his knee. The doctor further advised the family to get a CT scan and Blood test done for him. This was the final confirmation on the presence of a tumour and the method of treatment was explained to the family.</p>\r\n<p>Since the family could not afford the cost of treatment, they got Arpith treated for 3-months by an Ayurvedic doctor. However, the treatment had only alleviated the pain and the size of the tumour. Concerned, the family took him in for a second consultation and a scan with an orthopaedic in Mangalore and the results revealed that the tumour had become malignant.</p>\r\n<p>Moving ahead the family was referred to HCG Hospital, Bengaluru; where they consulted Dr.Pramod. After getting the biopsy report Arpith had to undergo 4-cycles of chemotherapy to remove and dissolve any lasting traces of the tumour making sure it does not recur.</p>\r\n<p>The family has gone back to Mangalore where, Arpith is currently going for his physiotherapy sessions under the supervision and consultation of Dr.Pramod&rsquo;s team.</p>\r\n<h2>Recent Update</h2>\r\n<p>Arpith, recently consulted with a Doctor. It is suspected that there might be a, &lsquo;Reoccurrence&rsquo;. His results are awaited.</p>','Arpith is a 14-year old boy studying in 10th std in a government and is very intelligent when it comes to his studies.','Arpith','Arpith is a 14-year old boy studying in 10th std in a government and is very intelligent when it comes to his studies.','','2024-08-06 16:32:17'),
	(14,'Moksha Jain','moksha-jain','moksha-jain-image_66b2033d86b2d.jpg','Thursday, 20 August, 2020','Inactive','<h2>About Moksha Jain</h2>\r\n<p>Moksha, is a 11 year old girl who stays with her family, she is the oldest out of the two children and is very close to her younger brother. Her mother works as an LIC agent and her father is a pygmy collector. The family lives in Mudbidri, Karnataka. She is a very active girl and loves dancing, especially her love for Bharatanatyam, she has completed her junior level in Bharatanatyam and also holds a black belt in Karate. In her free time she enjoys skating.</p>\r\n<h2>Medical Details</h2>\r\n<p>Moksha initially complained about a slight pain in her leg which gradually increased over time, even after basic medication. In due course, she developed a lump in her leg, for which she had to undergo various tests: &ndash; X-Ray, CT scan and blood tests were conducted by an Orthopaedic in Mudbidri.</p>\r\n<p>The family was then suggested to meet Dr.Pramod at HCG Hospital, where she underwent a PET Scan and Biopsy. The reports showed the presence of Osteosarcoma, which had grown over the previous few months. Moksha underwent a few cycles of chemotherapy and surgery to remove tumour and is currently doing better.</p>\r\n<h2>Recent Update</h2>\r\n<p>Moksha Jain underwent surgery at HCG Hospital, under the supervision of Dr.Pramod. She is currently undergoing her chemotherapy sessions at a hospital in Mudbidri and is responding positively to the treatment.</p>','Moksha, is a 11 year old girl who stays with her family, she is the oldest out of the two children and is very close to her younger brother.','Moksha Jain','Moksha, is a 11 year old girl who stays with her family, she is the oldest out of the two children and is very close to her younger brother.','','2024-08-06 16:34:29'),
	(15,'Amala','amala','amala-image_66b203b4e0dde.jpg','Monday, 24 August, 2020','Inactive','<h2>About Amala</h2>\r\n<p>Amala is a 67-year old lady staying with her three children, the family is originally from Tamil-Nadu and are currently staying in Kammanahalli, Bengaluru. Her husband expired 10-years back; her eldest son Peter works as a helper in a carpenter shop, her younger son Anthony is a Sales-executive at a clothing store and her daughter who is married works as a Beautician. Amala loves spending time with her children and in her free time enjoys watching films.</p>\r\n<h2>Medical Details</h2>\r\n<p>In April 2020, Amala started experiencing pain in her right breast and felt a lump that had increased in size. Her family initially took her to Silver Line Hospital in Kammanahalli, where she was asked to get an X-Ray and FNAC test. As they did not have the facility to conduct the tests, they were referred to Specialist Hospital, where Amala was able to get the FNAC test done, post which she was diagnosed with Carcinoma in her right breast.</p>\r\n<p>A family friend then asked the family to visit HCG Hospital, Bengaluru. At HCG Hospital, they consulted Dr.Jaganath Dixit, after seeing the reports she underwent a Mammogram and Biopsy. The next step was for her to undergo surgery conducted by Dr. Jaganath. The lump was removed and sent in for testing. Post the test results, Amala has to undergo 8-cycles of Chemotherapy and Radiotherapy.</p>\r\n<h2>Recent Update</h2>\r\n<p>Amala, has successfully completed her treatment and is on her follow-up consultation. This was possible by the means of your contributions and support from HCG Foundation.</p>','Amala is a 67-year old lady staying with her three children, the family is originally from Tamil-Nadu and are currently staying in Kammanahalli, Bengaluru.','Amala','Amala is a 67-year old lady staying with her three children, the family is originally from Tamil-Nadu and are currently staying in Kammanahalli, Bengaluru.','','2024-08-06 16:36:28'),
	(16,'Suvarna','suvarna','suvarna-image_66b2040d31461.jpg','Monday, 24 August, 2020','Inactive','<h2>About Suvarna</h2>\r\n<p>Suvarna is a 10-year old girl who stays with her family in H.D Kote, Mysore. Her father works as a daily wage worker and her mother takes up coolie work from time to time. Suvarna is a very active girl studying in 3rd STD in a government school along with her brother who is 2nd STD. She loves spending her time studying, reading and playing with her friends.</p>\r\n<h2>Medical Details</h2>\r\n<p>In June 2019, she began complaining about a pain in her neck, this pain was caused by the presence of a lump which was also the main culprit for her recurring and persistent fever. The family took her to KR Hospital where she underwent a biopsy. Post the test-results, she was diagnosed with Non-Hodgkin&rsquo;s Lymphoma. The Doctor in KR Hospital referred them to a hospital in Bengaluru, as this was inconvenient to the family, they approached Bharath Cancer HCG Hospital, Mysuru.</p>\r\n<p>At Bharath Cancer HCG Hospital, she underwent a CT-Scan, Blood test and surgery to treat the lump. Suvarna, now has to undergo 8-cycles of Chemotherapy.</p>\r\n<h2>Current Update</h2>\r\n<p>It is with a heavy heart that we share this update with you. Our cancer-fighter Suvarna is no longer with us! We convey our prayers and deepest condolences to her family. May she rest-in-peace!</p>','Suvarna is a 10-year old girl who stays with her family in H.D Kote, Mysore. Her father works as a daily wage worker and her mother takes up coolie work from time to time.','Suvarna','Suvarna is a 10-year old girl who stays with her family in H.D Kote, Mysore. Her father works as a daily wage worker and her mother takes up coolie work from time to time.','','2024-08-06 16:37:57'),
	(17,'Bharathbhai','bharathbhai','bharathbhai-image_66b2047f74cf1.jpg','Wednesday, 26 August, 2020','Inactive','<h2>About Bharathbhai</h2>\r\n<p>Bharatbhai is 40 yrs old, currently residing in Porbandar, Gujarat. He stays with his wife and two daughters (6 yrs &amp; 2.5 yrs respectively) in a rented house. He himself is working as a driver in courier line company since last 3 yrs and earning Rs 6000 per month.</p>\r\n<h2>Medical Details</h2>\r\n<p>Was operated earlier this year in Feb 2020, and after that was not working because of surgery and lockdown. Had started going to work since last one month, but again has got cancer and needs to undergo small surgery.</p>\r\n<p>Bharatbhai, had got pain in his mouth early this year and one of his relative who was operated in HCG; referred him to HCG, Ahmedabad. Patient was diagnosed with CA right buccal mucosa and was operated for the same in Feb 2020.</p>\r\n<p>After 6 months, he has been diagnosed with left cervical metastatic node and needs to undergo a small surgery.</p>\r\n<h2>Financial Details</h2>\r\n<p>He has spent 2-Lakhs for his pervious surgery, by borrowing money from his friends and relatives, who have supported him.</p>\r\n<p>At the moment he has exhausted all his resources and needs Rs 1,60,000/- for his 2nd surgery.</p>\r\n<h2>Required Aid</h2>\r\n<p>Bharatbhai needs a financial aid of Rs 1,60,000 for his 2nd surgery.</p>\r\n<h5>Total Fundraising Goal: INR 1,60,000</h5>','Bharatbhai is 40 yrs old, currently residing in Porbandar, Gujarat. He stays with his wife and two daughters','Bharathbhai','Bharatbhai is 40 yrs old, currently residing in Porbandar, Gujarat. He stays with his wife and two daughters','','2024-08-06 16:39:51'),
	(18,'Harini M','harini-m','harini-m-image_66b2050c75c57.jpg','Thursday, 3 September, 2020','Inactive','<h2>About Harini</h2>\r\n<p>Harini is a 12-year old school going child studying in 6th grade at Lawrence High school. She is the only child and stays with her family in Bengaluru. She loves spending time with her maternal grandmother and enjoys reading books, as english is her favourite subject. In her free time, Harini loves playing badminton, cycling classical dance, music and watching cartoons. Her dream is to become a Doctor after her education.</p>\r\n<h2>Medical Details</h2>\r\n<p>Initially would get recurring fever and slowly started developing red coloured patches on her body. Concerned about this development, she was taken to a general pediatrician. After undergoing certain blood tests the family was informed that her platelets are too low and they had to be treated. Later, she got a bone marrow test done and was diagnosed with; ALL &ndash; B cell stage-1(Acute Lymphoblastic Leukemia) and referred to HCG Hospital.</p>\r\n<p>At HCG Hospital; the family consulted Dr. Intezar, after going through reports and her condition suggested a 45 day &lsquo;hospitalization&rsquo;. Her treatment of chemotherapy started from April 2017 till 2019 May end. Up-till now she has finished 3-cycles of chemotherapy along with blood investigation and 5-cycles of maintenance chemotherapy.</p>\r\n<h2>Recent Update</h2>\r\n<p>Harini has completely recovered is currently on her follow-up consultations and undergoing blood investigations.</p>','Harini is a 12-year old school going child studying in 6th grade at Lawrence High school. She is the only child and stays with her family in Bengaluru.','Harini M','Harini is a 12-year old school going child studying in 6th grade at Lawrence High school. She is the only child and stays with her family in Bengaluru.','','2024-08-06 16:42:12'),
	(19,'Hethashree','hethashree','hethashree-image_66b2057d2ff84.jpg','Thursday, 3 September, 2020','Inactive','<h2>About Hethashree</h2>\r\n<p>Hethashree, is a 14-year old teenager who lives with her family of 4-members including her Parents and a younger brother(11-years old). Her mother is a house wife and father is an account manager at a construction company, 9 -months back he had a brain-stroke due to which he had to stop working.</p>\r\n<p>Hethashree is studying in 8th Std, along with her younger brother who is in 4th Std at Louis High School. She is very active when it comes to sports activities and is a track-runner at her school. She loves spending time with her family at home and in her free time enjoys listening to music.</p>\r\n<h2>Medical Details</h2>\r\n<p>In January 2020, she started having pain in her legs, hence; her parents took her to a physician near Nandini Layout. She was administered with painkillers which weren&rsquo;t effective in easing the pain. Gradually over the next few months she had developed a lump in her leg. Concerned about this, her family took her to &lsquo;Fortis Hospital&rsquo;, where she underwent an MRI-Scan . The orthopaedic confirmed the presence of &lsquo;Osteosarcoma&rsquo; and referred the family to HCG Hospital.</p>\r\n<p>At HCG Hospital, they consulted Dr. Pramod. Hethashree got a PET-CT Scan and Biopsy done, post which she underwent 2-cycles chemotherapy and surgery. April 1st, 2020 was when she started her first cycle of chemotherapy along with a chemo-port-insertion. She is yet to undergo four more admissions of chemotherapy and two surgeries</p>\r\n<h2>Recent Update</h2>\r\n<p>Hethashree has completed her treatment.</p>','Hethashree, is a 14-year old teenager who lives with her family of 4-members including her Parents and a younger brother(11-years old).','Hethashree','Hethashree, is a 14-year old teenager who lives with her family of 4-members including her Parents and a younger brother(11-years old).','','2024-08-06 16:44:05'),
	(20,'Mudassir','mudassir','mudassir-image_66b205e6d2a45.jpg','Thursday, 3 September, 2020','Inactive','<h2>About Mudassir</h2>\r\n<p>Mudassir, is a 16-year old teenage boy who stays in household of 5-members, his parents and two younger sister&rsquo;s 9-year old Madiha and 7-year old Misbah. His father is an Arabic teacher in a Mosque and his mother Mohsia is a homemaker.</p>\r\n<p>Mudassir is a smart, enthusiastic and responsible child who looks up to his parents. When taking a break from his daily activities, he loves drawing and playing games with his siblings</p>\r\n<h2>Medical Details</h2>\r\n<p>In the month of December(2019), a swelling had developed in Mudassir&rsquo;s neck, that began growing in size and became painful to touch. The first time around the Doctor&rsquo;s hinted that the reason for the swelling could be because of winter season in Bengaluru. However, over the next few days the swelling started interfering with his normal activities such as :- eating, drinking and even speaking.</p>\r\n<p>The family took him to a hospital where certain tests were done, post which; it was confirmed that the swelling was cancerous. He was then referred to HCG Hospital, where he met Dr. Intezar .After getting blood tests and scans done, the report revealed the presence of Hodgkin Lymphoma Stage 3. The method of treatment was explained to the family, and Mudassir began his Induction chemotherapy sessions. He has completed his initial treatment, he is on his follow up consultations, under investigation and is yet to undergo the final stage of treatment.</p>\r\n<p>Mudassir requires financial aid of 2-lakhs for his follow-up consultation, investigation and treatment.</p>\r\n<h2>Recent Update</h2>\r\n<p>Mudassir has successfully completed his treatment, he is currently studying in 9th STD and is living happily with his family. He is on regular follow-up with a pediatric oncologist.</p>','Mudassir, is a 16-year old teenage boy who stays in household of 5-members, his parents and two younger sister’s 9-year old Madiha and 7-year old','Mudassir','Mudassir, is a 16-year old teenage boy who stays in household of 5-members, his parents and two younger sister’s 9-year old Madiha and 7-year old','','2024-08-06 16:45:50'),
	(21,'Navdeep Reddy','navdeep-reddy','navdeep-reddy-image_66b2064c2315f.jpg','Thursday, 3 September, 2020','Inactive','<h2>About Navdeep Reddy</h2>\r\n<p>Navdeep is a 15-year old teenage boy who stays in a household of 4-members, his parents and ayounger brother. The family hail from Chittoor,Andhra Pradesh. Navdeep is studying in 9th Std. His father Chandrasekhar is a farmer, mother a home maker and younger brother is in 5th Std. Navdeep is a hardworking and studious boy who aspires to become an IAS officer. During his free time he enjoys playing cricket and watching adventurous movies.</p>\r\n<h2>Medical Details</h2>\r\n<p>In July 2018, Navdeep came home limping as he had hurt himself while playing. The pain was persistent and wasn&rsquo;t subsiding, concerned about this his family took him to a Hospital. After getting an X-ray, the report showed the presence of a tumor in his leg. To be certain about the diagnosis, the family took Navdeep to Ambedkar Hospital where it was confirmed that he had Osteosarcoma.</p>\r\n<p>The family was referred to HCG Hospital, where Navdeep got a round of tests and a biopsy done. He was then advised to undergo 3-cycles of chemotherapy and surgery to remove the tumor; post which, he underwent another 3-cycles of chemotherapy.</p>\r\n<h2>Recent Update</h2>\r\n<p>Navdeep has completed his surgery and chemotherapy, he is currently on his regular follow-up consultations with HCG Hospital, under Dr.Pramod. Navdeep has resumed his schooling (9th Std) back in Chittoor, Andhra Pradesh.</p>','Navdeep is a 15-year old teenage boy who stays in a household of 4-members, his parents and ayounger brother.','Navdeep Reddy','Navdeep is a 15-year old teenage boy who stays in a household of 4-members, his parents and ayounger brother.','','2024-08-06 16:47:32'),
	(22,'Rida','rida','rida-image_66b206f7c5efa.jpg','Thursday, 3 September, 2020','Inactive','<h2>About Rida</h2>\r\n<p>Rida, is an 8-year old girl studying in 1st Std, belongs to a family of four that includes her parents and a younger sister. The family is from Bengaluru and currently residing in R.T. Nagar. Her father is a technician in a lab and her mother is a teacher in a private school. Rida, loves going to school, spending time with her family and enjoys playing games with her younger sister.</p>\r\n<h2>Medical Details</h2>\r\n<p>In August 2017, Rida had fluctuating fever for approximately 4 weeks. As the antibiotics were not reducing her fever, her family got her CBC done in a diagnostic centre and consulted a pediatrist with the report. The doctor referred them to HCG Hospital, where Rida underwent a CBC and a Bone Marrow test. On 28th October 2017 she was diagnosed with, Acute-Lymphoblastic-Leukemia and the family was briefed about the line of treatment. The doctor started her chemotherapy in the month of December, which continued for a year. She also underwent her maintenance chemotherapy and is on her follow-up consultations.</p>\r\n<h2>Recent Update</h2>\r\n<p>Rida has completed her chemotherapy and is back to her normal life. She is studying in 1st Std at a school in R.T. Nagar. She is also on her regular follow-up consultations.</p>','Rida, is an 8-year old girl studying in 1st Std, belongs to a family of four that includes her parents and a younger sister.','Rida','Rida, is an 8-year old girl studying in 1st Std, belongs to a family of four that includes her parents and a younger sister.','','2024-08-06 16:50:23');

/*!40000 ALTER TABLE `patientstories` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table teams
# ------------------------------------------------------------

DROP TABLE IF EXISTS `teams`;

CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `team_image` varchar(255) DEFAULT NULL,
  `content` longtext,
  `short_description` text,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `schema_code` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;

INSERT INTO `teams` (`id`, `title`, `slug`, `designation`, `team_image`, `content`, `short_description`, `meta_title`, `meta_description`, `schema_code`, `created_at`)
VALUES
	(3,'Renu Golani','renu-golani','Medical Social Worker','renu-golani-image_66a232e886a11.jpg','<p>I am from Gujarat, which is famous for its culture, especially dance and food. I completed a masters degree in mathematics and worked in the banking sector, but soon found that something else lie in store for me. It has been a decade since I began working with financially underprivileged people. I Joined the Foundation in 2015 and currently head the Gujarat region.</p>','I am from Gujarat, which is famous for its culture, especially dance and food. I completed a masters degree in mathematics and worked in the banking sector, but soon found that something else lie in store for me. It has been a decade since I began working with financially underprivileged people. I Joined the Foundation in 2015 and currently head the Gujarat region.','Renu Golani - HCG Foundation','Renu Golani - HCG Foundation','','2024-07-25 16:41:36'),
	(4,'Dheekshetha','dheekshetha','Gallery Coordinator, HCG Foundation','hcg-default-image_66a23676acb31.png','<p>Dheekshetha is an enthusiastic Gallery Coordinator at the HCG Foundation, where she seamlessly blends her passion for art and helping others/ philanthropy. With a BVA from CKP, she leads innovative art therapy sessions for pediatric patients, organizes vibrant events for the pediatric ward, and curates&rsquo; impactful art shows. Additionally, Dheekshetha is instrumental in raising funds and managing the foundation\'s social media and CSR initiatives, all driven by her unwavering commitment to making a difference.</p>','Dheekshetha is an enthusiastic Gallery Coordinator at the HCG Foundation, where she seamlessly blends her passion for art and helping others/ philanthropy. With a BVA from CKP, she leads innovative art therapy sessions for pediatric patients, organizes vibrant events for the pediatric ward, and curates’ impactful art shows. Additionally, Dheekshetha is instrumental in raising funds and managing the foundation\'s social media and CSR initiatives, all driven by her unwavering commitment to making a difference.','Dheekshetha - Gallery Coordinator, HCG Foundation','Dheekshetha - Gallery Coordinator, HCG Foundation','','2024-07-25 16:56:46'),
	(5,'Omkara Murthy','omkara-murthy','Accounts Manager','omkar-murthy_66a239256d581.jpg','<p>Originating from Chitra Durga, Karnataka, I transitioned from a role in an accounting firm to embrace the impactful mission of the HCG Foundation. At the Foundation, my primary responsibilities encompass overseeing financial matters with meticulous attention to detail. Additionally, I actively engage in diverse administrative tasks, ensuring seamless operational support. I am driven by a deep commitment to contribute meaningfully to the Foundation\'s objectives, leveraging my expertise to foster efficiency and effectiveness. Together, let\'s continue to make a positive difference through our dedicated efforts.</p>','Originating from Chitra Durga, Karnataka, I transitioned from a role in an accounting firm to embrace the impactful mission of the HCG Foundation. ','Omkara Murthy - Accounts Manager','Omkara Murthy - Accounts Manager','','2024-07-25 17:08:13'),
	(6,'Hari','hari','Patient Care Coordinator','hcg-default-image_66a2399d7fd1f.png','<p>Leveraging my extensive experience in the BPO sector, I made a significant career shift to the non-profit arena during the COVID-19 lockdown. At HCG Foundation, my role as a Patient Care Coordinator is not just a job; it\'s a daily mission to make a meaningful impact.</p>\r\n<p>I am dedicated to guiding underprivileged patients through their treatment journeys, alleviating their burdens, and ensuring they receive the essential care they deserve. The joy on their faces and their heartfelt gratitude after successful treatments are unparalleled motivators, driving my unwavering commitment to helping many more patients in need.</p>','Leveraging my extensive experience in the BPO sector, I made a significant career shift to the non-profit arena during the COVID-19 lockdown. ','Hari - Patient Care Coordinator','Hari - Patient Care Coordinator','','2024-07-25 17:10:13'),
	(7,'Feros Khan','feros-khan','Sr. Manager','feros-khan-image_66a239f9b0d7a.jpg','<p>I began my career at an international bank in Dubai before joining the HCG Foundation in 2013. Transitioning to the NGO sector provided a refreshing psychological shift from the routine of working in the payroll department. At the HCG Foundation, I have experienced significant personal and professional growth, enjoying the autonomy to implement innovative strategies and ideas to further the Foundation\'s mission and vision. Currently, I lead the Foundation\'s Fundraising and Operations.</p>','I began my career at an international bank in Dubai before joining the HCG Foundation in 2013. Transitioning to the NGO sector provided a refreshing psychological shift from the routine of working in the payroll department.','Feros Khan -  Sr. Manager','Feros Khan -  Sr. Manager','','2024-07-25 17:11:45');

/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `reset_string` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `full_name`, `slug`, `email`, `username`, `password`, `reset_string`, `created_at`, `updated_at`)
VALUES
	(1,'Shiva Sheshendra','shiva-sheshendra','shivafeb17@gmail.com','shivafeb17@gmail.com','$2y$10$SEyYTxohV4h4LJFQDEUC3.A7DkMcek/.f4SwNBmFcyN6r69JL055e',NULL,'2024-07-19 13:59:19','2024-07-19 13:59:36'),
	(2,'admin','admin','admin@admin.com','admin@admin.com','$2y$10$GUs/Rvk/VTbkrhL/XhvpIeEwgG7MylBP0Hbe04Y91b3CCZP.G3zRO',NULL,'2024-07-25 19:56:25','2024-07-25 19:56:25');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
