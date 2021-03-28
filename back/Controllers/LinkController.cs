using System;
using System.Threading.Tasks;
using Curtme.Extensions;
using Curtme.Filters;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /
        ///     {
        ///        "URL": "https://curtme.org"
        ///     }
        ///
        /// </remarks>
        /// <param name="linkViewModel"></param>
        /// <returns>A newly shorted link</returns>
        /// <response code="200">Returns the newly shorted link</response>
        /// <response code="400">If the linkViewModel is null or is invalid URL or the url doesn't exist</response>
        [HttpPost]
        [Route("/")]
        [ProducesResponseType(typeof(Link), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create(LinkViewModel linkViewModel)
        {
            if (linkViewModel == null)
                return this.BadRequest(new { error = Constants.NO_BODY_ERROR });

            if (!linkViewModel.IsValidURL())
                return this.BadRequest(new { error = Constants.INVALID_URL_ERROR });

            var link = this.linkService.Create(linkViewModel.URL, linkViewModel.GetTitle(), this.HttpContext.User.GetId());

            return this.Ok(link);
        }

        /// <summary>
        /// This is the endpoint that people use when they click on a link
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /AAA123 (short URL)
        ///
        /// </remarks>
        /// <param name="shortURL"></param>
        /// <returns>Redirect to long URL</returns>
        /// <response code="302">Redirect to long url</response>
        /// <response code="400">If short url is null</response>
        /// <response code="404">If does not exist a link with that shortURL</response>
        [HttpGet]
        [Route("/{shortURL}")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Visit(String shortURL)
        {
            if (String.IsNullOrEmpty(shortURL))
                return this.BadRequest(new { error = Constants.SHORT_URL_REQUIRED_ERROR });

            var link = this.linkService.GetByShortURL(shortURL);

            if (link == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            var remoteIp = this.HttpContext.Connection.RemoteIpAddress;

            Task.Run(() => this.linkService.Visited(link, remoteIp));

            return this.Redirect(link.LongURL);
        }

        /// <summary>
        /// Get links
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /links-by-id?ids=AAA123 (shorts URL)
        ///
        /// </remarks>
        /// <param name="ids"></param>
        /// <returns>Get all links for that ids</returns>
        /// <response code="200">Always</response>
        [HttpGet]
        [Route("/links-by-id")]
        [ProducesResponseType(typeof(Link[]), StatusCodes.Status200OK)]
        public IActionResult Get([FromQuery] String[] ids)
        {
            var links = this.linkService.GetByIds(ids);

            return Ok(links);
        }

        /// <summary>
        /// Get all links for user logged
        /// If user is not logged in return 403
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /links
        ///
        /// </remarks>
        /// <returns>Get all links for current user</returns>
        /// <response code="200">Always</response>
        /// <response code="403">If user not logged in</response>
        [HttpGet]
        [Authorize]
        [Route("/links")]
        [ProducesResponseType(typeof(Link[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult GetUserLinks()
        {
            var links = this.linkService.GetAll(this.HttpContext.User.GetId());

            return Ok(links);
        }

        /// <summary>
        /// Set user in their links
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /sync
        ///     {
        ///        [id1, id2, id3]
        ///     }
        ///
        /// </remarks>
        /// <param name="linkIds"></param>
        /// <returns>Status 200 OK</returns>
        /// <response code="200">Always</response>
        /// <response code="403">If user not logged in</response>
        [HttpPut]
        [Authorize]
        [Route("/sync")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult Sync(String[] linkIds)
        {
            var userId = this.HttpContext.User.GetId();

            foreach (var linkId in linkIds)
            {
                this.linkService.Update(linkId, userId);
            }

            return Ok();
        }

        /// <summary>
        /// The user can change the shortURL
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /linkId/newShortURL
        ///     {
        ///        linkId, newShortURL
        ///     }
        ///
        /// </remarks>
        /// <param name="linkId"></param>
        /// <param name="newShortURL"></param>
        /// <returns>Status 200 OK</returns>
        /// <response code="200">Always</response>
        /// <response code="400">If linkId is empty</response>
        /// <response code="404">If linkId does not exist</response>
        /// <response code="400">If newShortURL is empty</response>
        /// <response code="400">If newShortURL was assigned</response>
        [HttpPut]
        [Route("/{linkId}/{newShortURL}")]
        public IActionResult Customize(String linkId, String newShortURL)
        {
            if (String.IsNullOrEmpty(newShortURL))
                return this.BadRequest(new { error = Constants.NEW_SHORT_URL_REQUIRED_ERROR });

            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            if (this.linkService.ExistByShortURL(newShortURL))
                return this.BadRequest(new { error = $"{newShortURL} {Constants.LINK_ALREADY_EXIST} " });

            var linkIn = this.linkService.GetById(linkId);

            if (linkIn == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            this.linkService.Customize(linkIn, newShortURL);

            return this.Ok();
        }

        /// <summary>
        /// The user delete old link
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     DELETE /linkId
        ///
        /// </remarks>
        /// <param name="linkId"></param>
        /// <returns>Status 200 OK</returns>
        /// <response code="200">Always</response>
        /// <response code="400">If linkId is empty</response>
        /// <response code="404">If linkId does not exist</response>
        [HttpDelete]
        [Route("/{linkId}")]
        public IActionResult Delete(String linkId)
        {
            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            var linkIn = this.linkService.GetById(linkId);

            if (linkIn == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            this.linkService.Delete(linkIn);

            return this.Ok();
        }

        [HttpPut]
        [Route("/consolidate")]
        [ServiceFilter(typeof(ClientIpCheckActionFilter))]
        public IActionResult Consolidate()
        {
            var links = this.linkService.Find(link => String.IsNullOrEmpty(link.Title) ||
                                              link.Date == DateTime.MinValue);

            foreach (var link in links)
            {
                if (link.Date == DateTime.MinValue)
                {
                    link.Date = DateTime.Now;
                }

                if (String.IsNullOrEmpty(link.Title))
                {
                    link.Title = link.LongURL.GetTitle();
                }

                this.linkService.Update(link);
            }

            return this.Ok(links);
        }
    }
}