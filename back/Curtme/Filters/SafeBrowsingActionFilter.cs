using System.Threading.Tasks;
using Curtme.Extensions;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Curtme.Filters
{
    public class SafeBrowsingActionFilter : ActionFilterAttribute
    {
        private readonly SafeBrowsingService safeBrowsingService;

        public SafeBrowsingActionFilter(SafeBrowsingService safeBrowsingService)
        {
            this.safeBrowsingService = safeBrowsingService;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var linkDTO = context.GetArgumentOfType<CreateLinkDto>();

            if (linkDTO != null && linkDTO.IsValid())
            {
                if (linkDTO.SourceURL.IsRecursiveURL(context.HttpContext))
                {
                    context.Result = new BadRequestObjectResult(new { error = Constants.SOURCE_URL_IS_ALREADY_SHORTENED_URL });
                }
                else
                {
                    var isSafeUrl = await this.safeBrowsingService.IsSafeUrl(linkDTO.SourceURL);

                    if (!isSafeUrl)
                        context.Result = new BadRequestObjectResult(new { error = Constants.SOURCE_URL_UNSAFE });
                }
            }

            await base.OnActionExecutionAsync(context, next);
        }
    }
}