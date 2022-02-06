using System;
using System.Linq;
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
        /// <param name="createLinkDTO"></param>
        /// <returns>A newly shorted link</returns>
        /// <response code="200">Returns the newly shorted link</response>
        /// <response code="400">If the sourceURL is null or empty or if sourceURL is not a valid URL</response>
        [HttpPost]
        [Route("/")]
        [ProducesResponseType(typeof(Link), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ServiceFilter(typeof(SafeBrowsingActionFilter))]
        public IActionResult Create(CreateLinkDto createLinkDTO)
        {
            if (!createLinkDTO.IsValid())
                return this.BadRequest(new { error = Constants.NO_BODY_ERROR });

            if (!createLinkDTO.IsValidURL())
                return this.BadRequest(new { error = Constants.INVALID_URL_ERROR });

            if (createLinkDTO.SourceURL.IsRecursiveURL(this.HttpContext))
                return this.BadRequest(new { error = Constants.SOURCE_URL_IS_ALREADY_SHORTENED_URL });

            var link = this.linkService.Create(createLinkDTO.SourceURL, createLinkDTO.GetTitle(), this.HttpContext.User.GetId());

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
        [ServiceFilter(typeof(LinkLockedActionFilter))]
        public IActionResult Visit(String shortURL)
        {
            if (String.IsNullOrEmpty(shortURL))
                return this.BadRequest(new { error = Constants.SHORT_URL_REQUIRED_ERROR });

            var link = this.linkService.GetByShortURL(shortURL);

            if (link == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            this.linkService.Visit(link, this.HttpContext.GetRequestInfo());

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
        /// <response code="403">If user tries to get links from other user</response>
        [HttpGet]
        [Route("/links-by-id")]
        [ProducesResponseType(typeof(Link[]), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetLinksById([FromQuery] String[] ids)
        {
            var links = this.linkService.GetByIds(ids);

            if (links.Any(link => !link.IsPublic && link.UserId != this.HttpContext.User.GetId()))
            {
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });
            }

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
                this.linkService.SyncToUser(linkId, userId);
            }

            return Ok();
        }

        /// <summary>
        /// The user can change the shortURL or sourceURL
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
        /// <param name="updateLinkDTO"></param>
        /// <returns>Updated link</returns>
        /// <response code="200">When the link was updated</response>
        /// <response code="400">If linkId is empty</response>
        /// <response code="404">If linkId does not exist</response>
        /// <response code="400">If sourceURL is empty and shortURL is empty</response>
        /// <response code="400">If shortURL is not empty but shortURL was assigned</response>
        /// <response code="400">If sourceURL is not empty but if sourceURL is not a valid URL</response>
        [HttpPut]
        [Route("/{linkId}")]
        [ServiceFilter(typeof(SafeBrowsingActionFilter))]
        public IActionResult Customize(String linkId, [FromBody] UpdateLinkDto updateLinkDTO)
        {
            if (String.IsNullOrEmpty(linkId))
                return this.BadRequest(new { error = Constants.LINK_ID_REQUIRED_ERROR });

            if (!updateLinkDTO.IsValid())
                return this.BadRequest(new { error = Constants.NO_BODY_ERROR });

            var linkIn = this.linkService.GetById(linkId);

            if (linkIn == null)
                return this.NotFound(new { error = Constants.NOT_FOUND_LINK_ERROR });

            if (updateLinkDTO.ShouldUpdateShortUrl() && linkIn.ShortURL != updateLinkDTO.ShortURL)
            {
                if (!updateLinkDTO.IsValidShortURL())
                    return this.BadRequest(new { error = $"{updateLinkDTO.ShortURL} {Constants.SHORT_URL_INVALID}" });

                if (this.linkService.ExistByShortURL(updateLinkDTO.ShortURL))
                    return this.BadRequest(new { error = $"{updateLinkDTO.ShortURL} {Constants.LINK_ALREADY_EXIST}" });

                linkIn.ShortURL = updateLinkDTO.ShortURL;
            }

            if (updateLinkDTO.ShouldUpdateSourceURL() && linkIn.SourceURL != updateLinkDTO.SourceURL)
            {
                if (!updateLinkDTO.IsValidURL())
                    return this.BadRequest(new { error = Constants.INVALID_URL_ERROR });

                if (updateLinkDTO.SourceURL.IsRecursiveURL(this.HttpContext))
                    return this.BadRequest(new { error = Constants.SOURCE_URL_IS_ALREADY_SHORTENED_URL });

                linkIn.SourceURL = updateLinkDTO.SourceURL;
                linkIn.Title = updateLinkDTO.GetTitle();
            }

            if (updateLinkDTO.ShouldToggleVisibility())
            {
                linkIn.ToggleVisibility();
            }

            this.linkService.Update(linkIn);

            return this.Ok(linkIn);
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