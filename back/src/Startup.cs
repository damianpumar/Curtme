using Curtme.Extensions;
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
            services.Configure<CurtMeDatabaseSettings>(
                    Configuration.GetSection(nameof(CurtMeDatabaseSettings)));

            services.AddSingleton<ICurtMeDatabaseSettings>(sp =>
                sp.GetRequiredService<IOptions<CurtMeDatabaseSettings>>().Value);

            services.AddSingleton<LinkService>();

            services.AddControllers();

            services.AddSwagger();
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

            app.UseDefaultFiles();

            app.UseStaticFiles();

            app.UseHttpsRedirection();

            app.UseSwaggerUIDeveloper();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
