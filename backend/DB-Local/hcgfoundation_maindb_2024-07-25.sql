# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: localhost (MySQL 5.7.39)
# Database: hcgfoundation_maindb
# Generation Time: 2024-07-25 16:21:18 +0000
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
	(1,'Testing Event','testing-event','urology-page-banner_66a24c9d2d27c.png','hcg-default-image_66a24c9d2d784.png','2024-07-26','Bangalore','40:30 PM','<p>some content for event page</p>','<p>event short description</p>','testing evemt','testing evemt','','2024-07-25 18:31:17'),
	(2,'Past Event Name','past-event-name',NULL,NULL,'2024-07-16','Chennai','04:30 PM','<p>This is a past event</p>','<p>Past Event Content short</p>','Past Event','Past Event','','2024-07-25 19:53:34');

/*!40000 ALTER TABLE `events` ENABLE KEYS */;
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
