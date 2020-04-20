using System;
using System.Threading.Tasks;
using Curtme.Models;
using Curtme.Services;
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
        public IActionResult Create(LinkDTO linkDTO)
        {
            if (linkDTO == null || !linkDTO.IsValidURL())
                return this.BadRequest(new { error = "Invalid URL" });

            var link = this.linkService.Create(linkDTO.URL);

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
        /// Get the stats of your links
        /// </summary>
        [HttpGet]
        [Route("/{shortURL}/stats")]
        public IActionResult Stats(String shortURL)
        {
            var link = this.linkService.Get(shortURL);

            if (link == null)
                return this.NotFound();

            return this.Ok(link);
        }
    }
}