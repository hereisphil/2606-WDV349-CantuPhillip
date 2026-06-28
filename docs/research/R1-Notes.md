# Project & Portfolio

* **Research Notes - Milestone 1**
* **Phillip Cantu**
* **Assignment Due Date:  Jun 7, 2026**

## Main Topic - Feature Branch Workflow (FBWF)

Instead of committing straight to production, FBWF isolates development tasks into dedicated branches. I will follow a strict multi-tiered progression: **Feature Branch ➔ Dev ➔ Stage ➔ Main**

* **Feature Branches:** Created off `dev` for specific tasks. It can be this specific `research` branch where I'm only updated the docs, or it can be a branch like `landing-page-hero-section`. This experimental code far from production and safe to "play with".
* **Dev:** The shared holding area where all our feature branches get merged via Pull Requests (PRs). This is the designated zone to run into and deal with merge conflicts.
* **Stage:** Represents feature-complete work. A PR happens from `dev` to `stage`. This is our last environment to _verify everything actually works_.
* **Main/Master (Production):** Totally locked down. Code only goes here after being verified in staging and receiving multiple approvals.
* **Deleting:** Once a feature hits main, delete the branch locally and remotely to clean up the clutter, then be sure to `git pull` to local dev environments to stay in sync.

### Reference Links

**Atlassian Git Tutorials**<br />[Comparing Git workflows: What you should know](https://www.atlassian.com/git/tutorials/comparing-workflows)

**GitHub Guides**<br />[About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)

**Git Documentation**<br />[Git Branching - Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)

**Note:**<br />The Atlassian tutorial was the most helpful for this milestone because it visually mapped out how branches interact, which directly relates to the Dev > Stage > Main chart provided in our assignment.

## Personal Research: Securing NPM Packages (A Modern Approach)

Lately there's been a number of NPM packages that have been attacked [[1]](https://unit42.paloaltonetworks.com/monitoring-npm-supply-chain-attacks/) [[2]](https://cybernews.com/security/npm-packages-with-millions-downloads-compromised/) [[3]](https://www.microsoft.com/en-us/security/blog/2026/05/29/33-malicious-npm-packages-abuse-dependency-confusion-profile-developer-environments/) and [ArmorCode](https://www.armorcode.com/blog/defending-against-npm-supply-chain-attacks-a-practical-guide) wrote guide on some simple practical steps on how to prevent these attacks. From my research, my opinion is that one of the easiest ways to prevent and mitage this issue it to have a **Minimum Release Age** (also called a Cooldown) defined within your project. However, since I am going to use Bun as my package manager I needed to find out how to do this with Bun. When I asked Google's [Gemini AI](https://gemini.google.com/share/cea54c82a431) it told me that Bun doesn't offer this option built-in and it gave me some workarounds. That didn't sound write to me and so I researched it. On the official [Bun documentation](https://bun.com/docs/pm/cli/install#minimum-release-age) I learned that I can easily create a `bunfig.toml` file with this or similar syntax:

```toml
[install]
# Only install package versions published at least 3 days ago
minimumReleaseAge = 259200 # seconds
```

### Reference Links

**Resource: ArmorCode**<br />[Defending Against NPM Supply Chain Attacks: A Practical Guide](https://www.armorcode.com/blog/defending-against-npm-supply-chain-attacks-a-practical-guide)

**Resource: Bun Docs**<br />[Minimum release age](https://bun.com/docs/pm/cli/install#minimum-release-age)

**Note:**<br />The ArmorCode guide was the most helpful because it give a very succinct rundown of how to protect my projects, and it was easy enough to find out how to do this with Bun v.s. NPM
