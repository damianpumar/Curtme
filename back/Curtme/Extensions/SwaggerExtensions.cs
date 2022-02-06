using System;
using System.IO;
using System.Linq;
using System.Reflection;
using Curtme.Filters;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Curtme.Extensions
{
    public static class SwaggerExtensions
    {
        public static void AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "Curt me, Free Open source and Unlimited link shortener",
                    Description = "Curt me web api doc",
                    Contact = new OpenApiContact
                    {
                        Name = "Damián Pumar",
                        Email = "damianpumar@gmail.com",
                        Url = new Uri("https://damianpumar.com"),
                    },
                    License = new OpenApiLicense
                    {
                        Name = "MIT",
                        Url = new Uri("https://github.com/damianpumar/curtme#license"),
                    }
                });

                c.DocumentFilter<SwaggerTagFilter>();

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
                    In = ParameterLocation.Header,
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });
            });
        }

        public static void UseSwaggerUIDeveloper(this IApplicationBuilder app)
        {
            app.UseSwagger();

            app.UseSwaggerUI(c =>
           {
               c.SwaggerEndpoint("/swagger/v1/swagger.json", "Curt me API");
               c.RoutePrefix = "developer";
           });
        }

        public static Boolean HasCustomAttribute<T>(this ApiDescription apiDescription)
        {
            var actionDescriptor = (ControllerActionDescriptor)apiDescription.ActionDescriptor;

            var attributes = actionDescriptor.MethodInfo.GetCustomAttributes<ServiceFilterAttribute>();

            return attributes.Any(a => a.ServiceType == typeof(T));
        }
    }

    public class SwaggerTagFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {

        }
    }
}