<?php
/**
 * Plugin Name: ÖBB Widget
 * Plugin URI:
 * Description: Embeds the OBB Planner as a WordPress widget
 * Version: 1.2
 * Author: Eszter Bordi, Sorin Davidoi, Andreea Muscalagiu and Lucie Triskova
 * Author URI:
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

/**
 * Add function to widgets_init that'll load our widget.
 * @since 0.1
 */
add_action('widgets_init', 'obb_widget_loader');

/**
 * Register our widget.
 * 'OBB_Widget' is the widget class used below.
 *
 * @since 0.1
 */
function obb_widget_loader()
{
    register_widget('OBB_Widget');
}

class OBB_Widget extends WP_Widget
{

    /**
     * Widget setup.
     */
    function OBB_Widget()
    {
        /* Widget settings. */
        $widget_ops = array('classname' => 'example',
            'description' => __('The good-old ÖBB Scotty Planner enhanced with date and time pickers')
        );

        /* Widget control settings. */
        $control_ops = array('width' => 300, 'height' => 350, 'id_base' => 'obb-widget');

        /* Create the widget. */
        $this->WP_Widget('obb-widget', __('ÖBB Scotty Planner', 'example'), $widget_ops, $control_ops);
    }

    /**
     * How to display the widget on the screen.
     */
    function widget($args, $instance)
    {
        // This will handle the click events on the two input fields
        $datepicker =
            "<script type=\"text/javascript\">
				jQuery(document).ready(function() {
				    jQuery('#MyDate').datepicker({
				        dateFormat : 'dd.mm.yy',
				        onSelect: function(date) {
				            // The value of this input field will get passed to the ÖBB website
							jQuery('#MyDate').val(date);
				        }
				    });

				    jQuery('#MyTime').timepicker({
				        onSelect: function(time) {
				            // The value of this input field will get passed to the ÖBB website
				            jQuery('#MyTime').val(time);
				        }
				    });
				});
			</script>";

        // This is the ÖBB Scotty Planner code, tweaked a little bit to display
        // the date and time input fields and hook them up to the pickers
        $obb_scotty = "
<h3 class=\"widget-title\">Public transport connections<h3>
<script type=\"text/javascript\" src=\"http://fahrplan.oebb.at/js/suggest/FSuggest_v1.0.js\"></script>
<link rel=\"stylesheet\" type=\"text/css\" href=\"http://fahrplan.oebb.at/css/scotty_suggest.css\">
<script type=\"text/javascript\">
var t_topMatches = \"Top matches\";
var t_lastInput = \"Last input\";
var t_suggestHint1 = \"No top matches found. Please make use of the <br/><b>suggest functionality</b>, by typing at least <br/><b>\";
var t_suggestHint2 = \"</b>characters!\";
var t_furtherMatches = \"Search for additional matches ...\";
</script>
<style type=\"text/css\">
    tr {
	    font-family: Arial, Helvetica, sans-serif;
        font-size: 0.9em;
        text-align: left;
        vertical-align: middle;
    }

    th {
        font-weight: bold;
        padding-left: 7px;
        padding-right: 10px;
    }

    td {
        padding: 2px 0;
    }

    input {
        padding: 4px;
        width: 130px;
    }

    #search_connections_button {
        font-size: 13px;
        background-color: #e5e5e5;
        color: #f00;
        border: solid 1px #c9c9c9;
        padding: 2.5px;
        margin: 10px 0 0 0;
        cursor: pointer;
        vertical-align: middle;
        text-align: center;
        float: right;
    }

#suggestionMenu                                             {background:url(http://fahrplan.oebb.at/img/vs_scotty/standard/bg_blu_content.png) 0 100px;}
#suggestion li.adr,#suggestion li.adrselected               {background-image:url(http://fahrplan.oebb.at/img/icons/icon_address.png);background-repeat:no-repeat;background-position: 0 0;}
#suggestion li.poi,#suggestion li.poiselected               {background-image:url(http://fahrplan.oebb.at/img/icons/icon_poi.png);background-repeat:no-repeat;background-position: 0 0;}
#suggestion li.oebb, #suggestion li.oebbselected            {background-image:url(http://fahrplan.oebb.at/img/icons/train.gif); }
.suggestButton                                              {background:url(http://fahrplan.oebb.at/img/vs_scotty/icons/icon_text_2.png) no-repeat 3px 3px;}
#more                                                       {background:url(http://fahrplan.oebb.at/img/mobile/delayNormal.png);}
.infobox                                                    {background:url(http://fahrplan.oebb.at/img/vs_scotty/icons/icon_arrow_2_hover.gif);}
.match,.matchhover                                          {background:url(http://fahrplan.oebb.at/img/vs_scotty/icons/icon_arrow_2.gif) no-repeat 0 7px;}
#HFS .matchhover                                            {background:url(http://fahrplan.oebb.at/img/vs_scotty/icons/icon_arrow_2_hover.gif) no-repeat 0 7px;}
#suggestion li.furtherMatches,
#suggestion li.furtherMatchesselected                      {background:url(http://fahrplan.oebb.at/img/vs_scotty/standard/bg_btn_mapblu.png) repeat-x scroll 0 0;}
#suggestion li                                             {background:url(http://fahrplan.oebb.at/img/vs_scotty/station.gif) no-repeat 2px 2px;}
.topmatches                                                 {background:url(http://fahrplan.oebb.at/img/vs_scotty/standard/bg_results_th.png) repeat scroll 0 0;}
</style>
<div style=\"width:235px; margin: 0 0 30px 0; background-color:#ffffff;\">
<div style=\"width: 100%; border: 1px solid #cecece; margin: 0; padding: 10px;\" summary=\"Layout\">
<div style=\"border-bottom:1px solid #CECECE; margin:4px;\" align=\"center\">
<img src=\"http://fahrplan.oebb.at/img/logo_oebb.gif\" style=\"width:132px;height:50px;\" alt=\"OEBB\" />
</div>
<form action=\"http://fahrplan.oebb.at/bin/query.exe/en?externalCall=yes\" name=\"formular\" method=\"post\" style=\"display:inline\" target=\"_blank\">
<input type=\"hidden\" name=\"queryPageDisplayed\" value=\"yes\" />
<input type=\"hidden\" value=\"UTF-8\" name=\"_charset_\">
<table cellspacing=\"0\" cellpadding=\"4\" style=\"width: 155px; margin: 0px;\" class=\"ig\">
<tr>
<th>From<input type=\"hidden\" name=\"REQ0JourneyStopsSA\" value=\"255\"></th>
<td colspan=\"2\">
<input id=\"hafas_inputgen_from\" type=\"text\" name=\"REQ0JourneyStopsSG\" value=\"\" accesskey=\"f\" tabindex=\"1\">
<script type=\"text/javascript\">
             gSuggest_for_company = 'oebb';
new FSuggest({loc:\"hafas_inputgen_from\",
type:\"S\",
minChar:4,
cookiename:\"DB4bibe-history\",
requestURL:\"http://fahrplan.oebb.at/bin/ajax-getstop.exe/en?REQ0JourneyStopsS0A=7&REQ0JourneyStopsB=12&S=\",
stopDelay:300 })
</script>
</td>
</tr>
<tr style=\"line-height: 20px;\">
<th>To</th>
<td colspan=\"2\">
<input type=\"hidden\" name=\"REQ0JourneyStopsZID\" value=\"A=1@O=Katsdorf Ortsplatz@X=14474071@Y=48317855@U=81@L=411085@B=1@p=1418289099@\">
Katsdorf Ortsplatz
</td>
</tr>
<tr>
<th>Date</th>
<td>
<input id=\"MyDate\" type=\"text\" name=\"REQ0JourneyDate\" accesskey=\"d\">
<script type=\"text/javascript\">
    var now = new Date();
    document.getElementById('MyDate').value = now.getDate()+\".\"+(now.getMonth()+1)+\".\"+now.getFullYear();
</script>
</td>
</tr>
<tr>
<th>Time</th>
<td>
<input id=\"MyTime\" type=\"text\" name=\"REQ0JourneyTime\" accesskey=\"c\">
<script type=\"text/javascript\">
    var now = new Date();
    document.getElementById('MyTime').value = now.getHours()+\":\"+now.getMinutes();
    </script>
</td>
</tr>
<tr>
<td colspan=\"2\">
<input class=\"radio\" type=\"radio\" name=\"REQ0HafasSearchForw\" value=\"1\"  checked style=\"width: 20px;\">Departure
<input class=\"radio\" type=\"radio\" name=\"REQ0HafasSearchForw\" value=\"0\"   style=\"width: 20px;\">Arrival
</td>
</tr>
<tr>
<td colspan=\"2\" style=\"padding-left: 12px;\">
<input type=\"hidden\" name=\"start\" value=\"Search connections\" />
<input type=\"submit\" id=\"search_connections_button\" name=\"start\" value=\"Search connections\" tabindex=\"5\"/>
</td>
</tr>
</table>
</form>
</div>
</div>
<script language=\"JavaScript1.2\" type=\"text/javascript\">
var time=new Date();
</script>
  ";

        // Add our datepicker to the scotty code
        echo $datepicker . $obb_scotty;
    }

    /**
     * Update the widget settings.
     */
    function update($new_instance, $old_instance)
    {
        $instance = $old_instance;

        return $instance;
    }

    /**
     * Displays the widget settings controls on the widget panel.
     * Make use of the get_field_id() and get_field_name() function
     * when creating your form elements. This handles the confusing stuff.
     */
    function form($instance)
    {
        /* Set up some default widget settings. */
    }
}

?>