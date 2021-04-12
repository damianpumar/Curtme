using Curtme.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Curtme.Filters
{
    public static class FiltersExtensions
    {
        public static void AddFilters(this IServiceCollection services)
        {
            services.AddScoped<ClientIpCheckActionFilter>(container =>
            {
                var configuration = container.GetRequiredService<IConfiguration>();

                return new ClientIpCheckActionFilter(configuration["AdminSafeList"]);
            });

            services.AddScoped<LinkLockedActionFilter>(container =>
           {
               var env = container.GetRequiredService<IWebHostEnvironment>();

               var linkService = container.GetRequiredService<LinkService>();

               return new LinkLockedActionFilter(env, linkService);
           });
        }
    }
}