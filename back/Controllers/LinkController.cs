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
        ///        "sourceURL": "https://curtme.org"
        ///     }
        ///
        /// </remarks>
        /// <param name="sourceURL"></param>
        /// <returns>A newly shorted link</returns>
        /// <response code="200">Returns the newly shorted link</response>
        /// <response code="400">If the linkViewModel is null or is invalid URL or the url doesn't exist</response>
        [HttpPost]
        [Route("/")]
        [ProducesResponseType(typeof(Link), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult Create(String sourceURL)
        {
            if (String.IsNullOrEmpty(sourceURL))
                return this.BadRequest(new { error = Constants.NO_BODY_ERROR });

            if (!sourceURL.IsValidURL())
                return this.BadRequest(new { error = Constants.INVALID_URL_ERROR });

            var link = this.linkService.Create(sourceURL, sourceURL.GetTitle(), this.HttpContext.User.GetId());

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
                // Remove this not found when implement the 404 links, or think other alternative.
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            var remoteIp = this.HttpContext.Connection.RemoteIpAddress;

            Task.Run(() => this.linkService.Visited(link, remoteIp));

            return this.Redirect(link.SourceURL);
        }

        /// <summary>
        /// Get links
        /// </summary>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /links-by-id?ids=AAA123
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
        public IActionResult SyncToUser(String[] linkIds)
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
        ///     PUT /linkId
        ///     {
        ///        linkId
        ///     }
        ///
        /// </remarks>
        /// <param name="linkId"></param>
        /// <param name="newShortURL"></param>
        /// <param name="newSourceURL"></param>
        /// <returns>Status 200 OK</returns>
        /// <response code="200">Always</response>
        /// <response code="400">If linkId is empty</response>
        /// <response code="404">If linkId does not exist</response>
        /// <response code="400">If newShortURL is empty</response>
        /// <response code="400">If newShortURL was assigned</response>
        [HttpPut]
        [Route("/{linkId}")]
        public IActionResult Customize(String linkId, [FromQuery] String newShortURL, [FromQuery] String newSourceURL)
        {
            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            if (String.IsNullOrEmpty(newShortURL) && String.IsNullOrEmpty(newSourceURL))
                return this.BadRequest(new { error = Constants.NEW_SHORT_URL_OR_SOURCE_URL_REQUIRED_ERROR });

            var linkIn = this.linkService.GetById(linkId);

            if (linkIn == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            if (!String.IsNullOrEmpty(newShortURL))
            {
                if (this.linkService.ExistByShortURL(newShortURL))
                    return this.BadRequest(new { error = $"{newShortURL} {Constants.LINK_ALREADY_EXIST} " });

                linkIn.ShortURL = newShortURL;
            }

            if (!String.IsNullOrEmpty(newSourceURL))
            {
                if (!newSourceURL.IsValidURL())
                    return this.BadRequest(new { error = Constants.INVALID_URL_ERROR });

                linkIn.SourceURL = newSourceURL;
                linkIn.Title = newSourceURL.GetTitle();
            }

            this.linkService.Update(linkIn);

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
    }
}