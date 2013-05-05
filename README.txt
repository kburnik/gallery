
*******************************************************************************************

Gallery - a jQuery plugin by Kristijan Burnik

*******************************************************************************************

<!-- HTML -->
<ul id='gallery1'>
	<li>
		<a href='#1'><img src="http://invision-web.net/tools/samples/images/img1.jpg" alt="Desc 1" /></a>
		<p class='desc'>Walking thru the woods</p>
	</li>
	<li>
		<a href='#2'><img src="http://invision-web.net/tools/samples/images/img2.jpg" alt="Desc 2" /></a>
		<p class='desc'>Resting near the lake</p>
	</li>
	<li>
		<a href='#3'><img src="http://invision-web.net/tools/samples/images/img3.jpg" alt="Desc 3" /></a>
		<p class='desc'>A waterfall surrounded by flowers</p>
	</li>
	<li>
		<a href='#4'><img src="http://invision-web.net/tools/samples/images/img4.jpg" alt="Desc 4" /></a>
		<p class='desc'>Rowing a boat on the lake</p></li>
	<li>
		<a href='#5'><img src="http://invision-web.net/tools/samples/images/img5.jpg" alt="Desc 5" /></a>
		<p class='desc'>The perfect vacation</p>
	</li>
</ul>

<!-- Javascript -->
<script>
$(function() {
	var $gallery = $('ul#gallery1').gallery();
});
</script>