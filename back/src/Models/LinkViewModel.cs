using System;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class LinkViewModel
    {
        public String URL { get; set; }

        public Boolean IsValidURL()
        {
            return this.URL.IsValidURL();
        }
    }
}