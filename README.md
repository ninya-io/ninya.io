# Ninya.io

>Find real Ninyas.

#### See it in action right [here](http://www.ninya.io)!



### Search for StackExchange users near you
Ever wanted to discover StackExchange (StackOverflow, Server Fault, Super User etc) users around you that share your interests? StackWho makes it possible to find other StackExchange users near your, sorted by reputation. You can further filter them by tags. ATTENTION: If you are a company and are trying to find new employees, StackExchange offers a paid search that probably match your needs much better. This is not an attempt to compete with them.

### What's happening behind the scenes?
StackExchange does not offer a public search API (they have a paid candidate search though!). That means,
we first have to fetch all their users (currently only the top 150,000) and combine them with their top 30 tags of the answers they have given. We store that information in a PostgresSQL (yep, Postgres can be used as a schemaless DB!) database on heroku. We then use a slim Node.js
backend to serve our client requests.

### Contribute

If you like to contribute to StackWho please checkout the [open issues](https://github.com/cburgdorf/ninya.io/issues?state=open). If you like to work on all the nitty gritty stuff you need to setup a local postgres database to work with.

However, if you like to work on the UI part (the project is totally lacking designers!) all you gotta do is
set the `backendEndpoint` configuration to `http://www.ninya.io`(https://github.com/cburgdorf/ninya.io/blob/master/client/src/common/config.js#L4) and start chrome with `--disable-web-security` so that requests from your `localhost` to `www.ninya.io` are possible.

To kickoff the app just run `node server/web.js`.

The code is covered by the MIT license and I'm happy to see people joining forces with me.


--Christoph
