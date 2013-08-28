# StackWho

####What's the deal?

Ever wanted to discover StackExchange (StackOverflow, Server Fault, Super User etc) users around you that share your interests? StackWho makes it possible to find other StackExchange users near your, sorted by reputation. You can further filter them by tags. ATTENTION: If you are a company and are trying to find new employees, StackExchange offers a paid search that probably match your needs much better. This is not an attempt to compete with them.

####How?

StackExchange does not offer a public search API (they have a paid candidate search though!). That means we have to find different ways to still provide the desired functionality. StackWho solves that problem by first fetching the N top users (reputation wise) and then hold them in memory so that they can be further analyzed. To get started click on "Start Search Index build" and see the number of cached users increasing. You can directly start running further location based filters on top of the already cached users. Running location searches does *NOT* influence the build process of the index. Consider the build process of the index as a backend task (even so it's not using worker threads) that you can start, pause, continue or completly reset. Please note that the StackExchange API will throttle the requests at some point which slows down the process. As an advice: you probably don't need to fetch more than 20.000 users.

####Tag data

The whole purpose of StackWho is finding users near your that *share your interests*. So you need to have a method to not only filter by location but also by tags. However, we simply can't fetch all the tag data among with all the users. That would be extremely slow. What you can do is fetch the tag data for selected users. Just select a bunch of users and click on "fetch tag data". The data gets written to the user and stays cached for the entire session.

####Developing

This is more or less an early spike that was built in a very short amount of time.
At this stage it's missing tests, a proper build chain, travis integration etc. pp
Lot's of things are in flux.

However, the code is covered by the MIT license and I'm happy to see people joining forces with me.

####See it in action

http://cburgdorf.github.io/StackWho/src/index.html

--Christoph