function msToTime(duration) {
	function addZero(num) {
		return (num < 10) ? '0' + num : num;
	}

	var ms = duration % 1000;
	duration = (duration - ms) / 1000;
	var s = duration % 60;
	duration = (duration - s) / 60;
	var m = duration % 60;
	duration = (duration - m) / 60;
	var h = duration % 24;
	duration = (duration - h) / 24;
	var d = duration % 24;

	if(h && h > 0)
		return h + ":" + addZero(m) + ":" + addZero(s);
	else
		return m + ":" + addZero(s);
}

function numAddCommas(num) {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}