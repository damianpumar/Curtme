using System;
using System.Linq;
using System.Threading.Tasks;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;

namespace Curtme.Filters
{
    public class SafeBrowsingActionFilter : ActionFilterAttribute
    {
        private readonly string baseURL;

        private readonly SafeBrowsingService safeBrowsingService;

        public SafeBrowsingActionFilter(IConfiguration configuration, SafeBrowsingService safeBrowsingService)
        {
            this.baseURL = configuration["FrontEnd:URL"];

            this.safeBrowsingService = safeBrowsingService;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (context.ActionArguments.Any())
            {
                var linkDTO = context.ActionArguments.Last().Value as CreateLinkDto;

                if (linkDTO != null && linkDTO.IsValid() && linkDTO.IsValidURL())
                {
                    var isSafeUrl = await this.safeBrowsingService.IsSafeUrl(linkDTO.SourceURL);

                    if (!isSafeUrl)
                        context.Result = new RedirectResult(this.GetRedirectURL(linkDTO.SourceURL));
                }
            }

            await base.OnActionExecutionAsync(context, next);
        }

        private String GetRedirectURL(string sourceURL)
        {
            return $"{baseURL}/#/unsafe/{sourceURL}";
        }
    }
}