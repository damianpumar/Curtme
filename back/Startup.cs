using Curtme.Extensions;
using Curtme.Filters;
using Curtme.Models;
using Curtme.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Curtme
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDetection();

            services.Configure<CurtMeDatabaseSettings>(
                    Configuration.GetSection(nameof(CurtMeDatabaseSettings)));

            services.AddSingleton<ICurtMeDatabaseSettings>(sp =>
                sp.GetRequiredService<IOptions<CurtMeDatabaseSettings>>().Value);

            services.AddSingleton<MongoDBService>();

            services.AddScoped<GeoLocationService>();

            services.AddScoped<LinkService>();

            services.AddScoped<LinkDetailsService>();

            services.AddScoped<UserService>();

            services.AddControllers();

            services.AddSwagger();

            services.AddAuth0();

            services.AddFilters();

            services.AddHttpContextAccessor();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(builder => builder.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod());

            app.UseHttpsRedirection();

            app.UseDefaultFiles();

            app.UseStaticFiles();

            app.UseSwaggerUIDeveloper();

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
