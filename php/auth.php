<?php 
	// $connect = mysql_connect('localhost', 'root') or die(mysql_error());
	// mysql_select_db('tit_rack');
	$connect = mysql_connect('tlt.mysql','tlt_mysql', '6Tp+TchR') or die(mysql_error());
	mysql_select_db('tlt_rack');

	$auth_login    = trim($_POST['auth_login']);
	$auth_password = md5($_POST['auth_password']);
	$query = mysql_query("SELECT * from users WHERE login = '$auth_login'");
	$user_data = mysql_fetch_array($query);

	if ($user_data['password'] == $auth_password) {
		echo "true";
	} else {
		echo "false";
	}
?>
