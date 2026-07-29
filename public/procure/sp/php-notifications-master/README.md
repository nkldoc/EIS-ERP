
configuration >>>
mysql localhost "root" "" "notif"

sqlScript >>>>

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET time_zone = "+00:00";


CREATE TABLE `comments` (

 `comment_id` int(11) NOT NULL,

 `comment_subject` varchar(250) NOT NULL,

 `comment_text` text NOT NULL,

 `comment_status` int(1) NOT NULL

) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `comments`

 ADD PRIMARY KEY (`comment_id`);


ALTER TABLE `comments`

 MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;



<<<< sqlScript