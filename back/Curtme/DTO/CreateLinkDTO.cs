using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Curtme.Extensions;

namespace Curtme.Models
{
    public class CreateLinkDto : IValidatableObject
    {
        public String SourceURL { get; set; }

        public Boolean IsValid()
        {
            return !String.IsNullOrEmpty(this.SourceURL);
        }

        public Boolean IsValidURL()
        {
            return this.SourceURL.IsValidURL();
        }

        public String GetTitle()
        {
            return this.SourceURL.GetTitle();
        }

        public virtual IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!this.IsValid())
                yield return new ValidationResult(Constants.NO_BODY_ERROR);

            else if (!this.IsValidURL())
                yield return new ValidationResult(Constants.INVALID_URL_ERROR);
        }
    }
}