Museum
======

# Description #
This is a team project by a group of studentsgit  at Johannes Kepler University for the subject Web Engineering (2014W).

The aim of the project is to implement a Wordpress plugin that would be useful for the [Museum of Teasal in Katzdorf](http://www.ooemuseumsverbund.at/museum/18_karden-_und_heimatmuseum).

# Plugin description #
The purpose of this widget is to provide users of the website a quick way to plan their trip to the museum.

The plugin makes use of [ÖBB Scotty Route Planner](http://fahrplan.oebb.at/bin/help.exe/en?tpl=inputgen_start). The code provided by ÖBB only allows the users to set from where the journey should begin, lacking options for the date and time of the journey. This Wordpress plugin solves this by making use of [jQuery UI Datepicker](http://jqueryui.com/datepicker/) and [jQuery Timepicker Addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon) to allow the user to select the date and time.

# Dependencies #
As this widget uses [jQuery UI Datepicker](http://jqueryui.com/datepicker/) and [jQuery Timepicker Addon](https://github.com/trentrichardson/jQuery-Timepicker-Addon), some Javascript files and CSS Stylesheets need to be imported into Wordpress. The method used for this during the development of the plugin was to clone an existing theme and add the following lines to `functions.php`:

```
// jQuery UI
wp_enqueue_script('jquery-ui', 'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js', array(), '1.11.2', 'no');
wp_enqueue_style('jquery-ui-style', 'https://code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css');

// jQuery UI TimePicker Addon
wp_enqueue_script('jquery-ui-timepicker-addon', '//cdn.jsdelivr.net/jquery.ui.timepicker.addon/1.4.5/jquery-ui-timepicker-addon.js', array('jquery-ui'), '1.4.5', 'no');
wp_enqueue_script('jquery-ui-timepicker-addon-style', '//cdn.jsdelivr.net/jquery.ui.timepicker.addon/1.4.5/jquery-ui-timepicker-addon.css');
```

For example, for the theme Twenty Twelve this lines could be added to the `twentytwelve_scripts_styles` function.

# Usage #
After installing and enabling the plugin to go `Appearance -> Widgets` and drag the `ÖBB Scotty Planner` to the `Main Sidebar` section.
