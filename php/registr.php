<?php 
	// $connect = mysql_connect('localhost', 'root') or die(mysql_error());
	// mysql_select_db('tit_rack');
	$connect = mysql_connect('tlt.mysql','tlt_mysql', '6Tp+TchR') or die(mysql_error());
	mysql_select_db('tlt_rack');

	$username   = trim($_POST['username']);
	$login      = trim($_POST['login']);
	$phone      = trim($_POST['phone_number']);
	$password   = md5(trim($_POST['password']));

	$query = mysql_query("INSERT INTO users VALUES ('','$username','$login', '$phone', '$password')") or die(mysql_error());
?>
