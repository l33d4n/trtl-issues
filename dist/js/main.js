class FetchData {

	static fetchJson(path) {
		return new Promise((resolve, reject) => {
			fetch(path)
				.then((result) => result.json())
				.then((result) => {
					resolve(result)
				})
				.catch((error) => reject(error))
		})
	}

	static fetctGithubApi(url) {
		return new Promise((resolve, reject) => {
			fetch(url).then((result) => result.json())
				.then((result) => {
					resolve(result)
				})
				.catch((error) => reject(error))
		})
	}

}

class Tamplates {

	static sideBarItem(repo) {
		return `<li class="toc-entry toc-h2"><a href="#${repo.repo_name}">${repo.repo_name}</a></li>`
	}

	static labelItem(label) {
		return `    
        <div class="item-labels d-inline-block p-0">
          <span class="badge" style="background-color: #${label.color};">${label.name}</span>
       </div>`
	}

	static issueItem(issue) {
		let css = issue.comments > 0 ? 'list-item-actions show' : 'd-none'

		return `
            <div class="list-item">
            <div class="item">
            <a href="${issue.html_url}" target="_blank" class="text-body h4 d-inline-block mb-0" data-toggle="tooltip" data-placement="top" title="${issue.body}">${issue.title}</a>
                ${issue.labels.map((label) => {
            return Tamplates.labelItem(label)
        }).join('')}
                <small class="d-block text-muted mt-n1">#${issue.number} opened on ${fixDate(issue.created_at)} by ${issue.user.login}</small>
            </div>
               <a href="${issue.html_url}" target="_blank" class="${css}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z"></path>
                        <path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4"></path>
                        <line x1="8" y1="9" x2="16" y2="9"></line>
                        <line x1="8" y1="13" x2="14" y2="13"></line>
                </svg>${issue.comments}
            </a>
        </div>
        `
	}

	static repoHeader(repo, issuesLength) {
		return `
            <div class="card-header">
               <h3 class="card-title">
                ${repo.user_name}/${repo.repo_name} 
                <span class="badge badge-pill bg-green">${issuesLength}</span>
               </h3>
           </div>`
	}

	static dispalyCardRepo(repo, filtredPullRequests) {
		return `<div id="${repo.repo_name}" class="card">
                  ${Tamplates.repoHeader(repo, filtredPullRequests.length)}
                <div class="list list-row list-hoverable">
                    ${filtredPullRequests.map((issue) => {
            return Tamplates.issueItem(issue)
        }).join('')}
        </div>
        </div>`
	}

}

async function main() {
	spinner(true)

	let cards = ''
	let totalIsuuse = 0

	const main = document.querySelector('#main')
	const sideBarList = document.querySelector('.list-unstyled')
	const bodySideBar = document.querySelector('.sticky-top')
	bodySideBar.style.display = 'none'

	try {
		const repos = await FetchData.fetchJson('../../repos.json')

		for (const repo of repos) {

			const issuesOfRepo = await FetchData.fetctGithubApi(`https://api.github.com/repos/${repo.user_name}/${repo.repo_name}/issues`)

			if (issuesOfRepo.length > 0) {
				let filtredPullRequests = filterPullRequest(issuesOfRepo)

				if (filtredPullRequests.length > 0) {
					totalIsuuse += filtredPullRequests.length

					sideBarList.innerHTML += Tamplates.sideBarItem(repo)

					cards += Tamplates.dispalyCardRepo(repo, filtredPullRequests)
				}
			}

			main.innerHTML = cards

			document.querySelector('.page-title').innerText = totalIsuuse + ' Open issuses'
		}

		bodySideBar.style.display = 'block'
		spinner(false)
		$('[data-toggle="tooltip"]').tooltip();
	} catch (error) {
		spinner(false)
		alert(error)
	}
}

function filterPullRequest(issuse) {
	return issuse.filter((issue) => !issue.pull_request)
}

function fixDate(date) {
	return date.slice(0, date.indexOf('T'))
}

function spinner(status) {
	let loader = document.querySelector('#con')
	if (status) {
		loader.classList.add('con')
		loader.innerHTML = `<div class="loader"></div>`
	} else {
		loader.classList.remove('con')
		loader.innerHTML = ''
		$("body").css("overflow-y", "scroll");
	}
}

main()
