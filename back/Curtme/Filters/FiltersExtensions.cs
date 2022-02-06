using Curtme.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Curtme.Filters
{
    public static class FiltersExtensions
    {
        public static void AddFilters(this IServiceCollection services)
        {
            services.AddScoped<LinkLockedActionFilter>(container =>
           {
               var configuration = container.GetRequiredService<IConfiguration>();

               var linkService = container.GetRequiredService<LinkService>();

               return new LinkLockedActionFilter(configuration, linkService);
           });

            services.AddScoped<SafeBrowsingActionFilter>(container =>
           {
               var configuration = container.GetRequiredService<IConfiguration>();

               var safeBrowsingService = container.GetRequiredService<SafeBrowsingService>();

               return new SafeBrowsingActionFilter(configuration, safeBrowsingService);
           });
        }
    }
}