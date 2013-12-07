# StackWho

####What's the deal?

Ever wanted to discover StackExchange (StackOverflow, Server Fault, Super User etc) users around you that share your interests? StackWho makes it possible to find other StackExchange users near your, sorted by reputation. You can further filter them by tags. ATTENTION: If you are a company and are trying to find new employees, StackExchange offers a paid search that probably match your needs much better. This is not an attempt to compete with them.

####How?

StackExchange does not offer a public search API (they have a paid candidate search though!). That means,
we first have to fetch all their users (actually only the top 20,000) and combine them with their top 30 tags of the answers they have given. We store that information in a CouchDB on heroku. We then use a slim Node.js
backend to serve our client requests.

####Developing

If you like to contribute to StackWho please checkout the [open issues](https://github.com/cburgdorf/StackWho/issues?state=open)

If you like to work on all the nitty gritty stuff you need to setup a local postgres database to work with.

However, if you like to work on the UI part (the project is totally lacking designers!) all you gotta do is
set the `backendEndpoint` configuration to `http:stackwho.herokuapp.com`(https://github.com/cburgdorf/StackWho/blob/master/client/src/common/config.js#L4) and start chrome with `--disable-web-security` so that requests from your `localhost` to `stackwho.herokuapp` are possible.

To kickoff the app just run `node server/web.js`.

However, the code is covered by the MIT license and I'm happy to see people joining forces with me.

####See it in action

http://stackwho.herokuapp.com

--Christoph
