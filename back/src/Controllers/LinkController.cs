using System;
using System.Threading.Tasks;
using Curtme.Extensions;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Curtme.Controllers
{
    [ApiController]
    public class LinkController : ControllerBase
    {
        private readonly LinkService linkService;

        public LinkController(LinkService linkService)
        {
            this.linkService = linkService;
        }

        /// <summary>
        /// Create your short link.
        /// </summary>
        [HttpPost]
        [Route("/")]
        public IActionResult Create(LinkViewModel linkViewModel)
        {
            if (linkViewModel == null || !linkViewModel.IsValidURL())
                return this.BadRequest(new { error = "Invalid URL" });

            var link = this.linkService.Create(linkViewModel.URL, this.HttpContext.User.GetId());

            return this.Ok(link);
        }

        /// <summary>
        /// This is the endpoint that people use when they click on a link
        /// </summary>
        [HttpGet]
        [Route("/{shortURL}")]
        public IActionResult Visit(String shortURL)
        {
            var link = this.linkService.Get(shortURL);

            if (link == null)
                return this.NotFound();

            Task.Run(() => this.linkService.Visited(link));

            return this.Redirect(link.LongURL);
        }

        /// <summary>
        /// Get the info of your links
        /// </summary>
        [HttpGet]
        [Route("/{id}/info")]
        public IActionResult Get(String id)
        {
            var link = this.linkService.Get(id);

            if (link == null)
                return this.NotFound();

            return this.Ok(link);
        }

        /// <summary>
        /// Get all links for user logged
        /// If user is not logged in return 403
        /// </summary>
        [HttpGet]
        [Authorize]
        [Route("/info")]
        public IActionResult GetAll()
        {
            var links = this.linkService.GetAll(this.HttpContext.User.GetId());

            return Ok(links);
        }
    }
}