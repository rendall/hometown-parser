Hometown Parser
=============

Input a string, output an array of possible place-names. Demo: [https://rendall.github.io/hometown-parser/](https://rendall.github.io/hometown-parser/)

Motivation
-----------

The 'hometown' field for Burning Man theme camps is often creatively interpreted by users filling out the form, so location data can be difficult to glean. This is an attempt to normalize the information. It may be useful in other similar circumstances as well.

Approach
--------

This is a hand-crafted algorithm based on pattern-matching and trial-and-error. Still, even the most creative essays and interpretations of 'hometown' in this field follows general patterns, and the algorithm is *good enough*.

TODO
----

- incorporate the [World Cities](https://github.com/datasets/world-cities) dataset

Detail
------

You are hosting a gathering of creative people from all over the world, and in order to be well prepared, you have an online form by which affiliated individuals let you know they are affiliated.  Your form perhaps has a 'group name' field and a 'date of arrival' field and a 'number of members' field.  

You also have a 'hometown' field.

For some of these groups, it's pretty straightforward:  
"Moscow"
"Helsinki"
"Peoria, IL"

But for other groups, it's complicated:
"Sydney, Salt Spring Island, BC and Christiania, Denmark"
"SEATTLE/LOS GATOS/NYC"
"Phoenix, Wyszków"

Other folks like to write novels:
"Goa. This is were the founding members of the group met, most people are from different countries but Goa is the origin".
"Vatican City (mostly), with a couple from Mauritania, Utah, and Zion, IL"

There are also many names for towns, and folks use them all:
Montreal, Montréal
San Francisco, San Francisco Bay Area, SF, SFO
Philadelphia, Philly, PHL

You would love to, somehow, get a good grasp of where all these groups are coming from, but "SF" is so different from "RIO DE JANEIRO-BRAZIL AND SAN FRAN"

This is where the Hometown Parser can help you out.

Installation
-----------

The parser uses [Ramdajs](https://cdnjs.cloudflare.com/ajax/libs/ramda/0.24.1/ramda.min.js).  You will need to reference that before loading hometown.js. Then reference [hometowns.js](https://raw.githubusercontent.com/rendall/hometown-parser/master/js/hometowns.js).

If you're making a website, you can try putting this into the `<head>` tag:

`<script src="https://cdnjs.cloudflare.com/ajax/libs/ramda/0.24.1/ramda.min.js" integrity="sha384-OricteDxGJ77wQTPXdPmz8SoLVmEkW51fQRzhTGmUXG6u608OIFWHzCVwDFki+w6" crossorigin="anonymous"></script>`

followed by

`<script src="https://raw.githubusercontent.com/rendall/hometown-parser/master/js/hometowns.js"></script>`

but, I dunno. You might want to have those files be local, instead.

Alternatively, you can clone the repository which contains all that is necessary. Therein is a [hometown.html](https://raw.githubusercontent.com/rendall/hometown-parser/master/hometown.html) webpage with examples and unit tests.

Usage
-----

Run your string through the `parseTowns` function, as in

`parseTowns("Our group members hail primarily from: San Francisco, Seattle, Louisville, Tolendo, Toronto, Vegas and Southern California")`

and the Hometown Parser will return an array of strings representing its best guess as to what those place names are:

`["San Francisco","Seattle","Louisville","Tolendo","Toronto","Vegas","Southern California"]`

You can also then run those strings through `toCanonicalName` as in

`parseTowns("NYC/PHL/PDX/OKC/LA/Vegas").map((s) => toCanonicalName(s))`

which will output

`["NYC","Philadelphia","Portland","Las Vegas","Oklahoma City","Los Angeles","Las Vegas"]`

Check [hometown.html](https://raw.githubusercontent.com/rendall/hometown-parser/master/hometown.html) for examples.

Contributing
------------

Definitely! Create an [issue](issues) or:

Clone the repo and get to work!  It's written using Typescript and Ramda, so if you know / want to learn those, this is a good project for you.

The algorithm is by no means perfect, so if you see a way to improve it, show me!

* Install [NPM](https://www.npmjs.com/get-npm)
* Clone this repository.
* Navigate to the repo directory using your favorite terminal.
* Type `npm install`.
* `./ts/hometown.ts` is the working copy. Edit that.
* Type `npm build`.
* Open `hometown.html` in your favorite browser to test.