using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Curtme.Models
{
    public class UpdateLinkDto : CreateLinkDto
    {
        public String ShortURL { get; set; }

        public Boolean? ToggleVisibility { get; set; }

        public new Boolean IsValid()
        {
            return this.ShouldUpdateShortUrl() || this.ShouldUpdateSourceURL() || this.ShouldToggleVisibility();
        }

        public Boolean ShouldToggleVisibility()
        {
            return this.ToggleVisibility.HasValue && this.ToggleVisibility.Value;
        }

        public Boolean ShouldUpdateSourceURL()
        {
            return !String.IsNullOrEmpty(this.SourceURL);
        }

        public Boolean ShouldUpdateShortUrl()
        {
            return !String.IsNullOrEmpty(this.ShortURL);
        }

        public Boolean IsValidShortURL()
        {
            return !String.IsNullOrEmpty(this.ShortURL) &&
                   this.ShortURL.Length >= ShortUrlConstants.LengthUpdateMin &&
                   this.ShortURL.Length <= ShortUrlConstants.LengthUpdateMax &&
                   this.HasShortURLValidCharacters();
        }

        private Boolean HasShortURLValidCharacters()
        {
            foreach (char character in this.ShortURL)
            {
                if (!ShortUrlConstants.ValidCharactersShortURL.Contains(character))
                    return false;
            }

            return true;
        }

        public override IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!this.IsValid())
                yield return new ValidationResult(Constants.NO_BODY_ERROR);

            else if (this.ShouldUpdateSourceURL() && !this.IsValidURL())
                yield return new ValidationResult(Constants.INVALID_URL_ERROR);

            else if (this.ShouldUpdateShortUrl() && !this.IsValidShortURL())
                yield return new ValidationResult($"{this.ShortURL} {Constants.SHORT_URL_INVALID}");
        }
    }
}