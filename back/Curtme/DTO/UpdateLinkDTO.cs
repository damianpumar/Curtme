using System;

namespace Curtme.Models
{
    public class UpdateLinkDTO : CreateLinkDTO
    {
        public String ShortURL { get; set; }

        public override Boolean IsValid()
        {
            return !String.IsNullOrEmpty(this.ShortURL) || this.IsValidSourceURL();
        }

        public Boolean IsValidSourceURL()
        {
            return base.IsValid();
        }

        public Boolean IsValidShortURL()
        {
            return !String.IsNullOrEmpty(this.ShortURL) &&
                   this.ShortURL.Length >= ShortURLConstants.LengthUpdateMin &&
                   this.ShortURL.Length <= ShortURLConstants.LengthUpdateMax &&
                   this.HasShortURLValidCharacters();
        }

        private Boolean HasShortURLValidCharacters()
        {
            foreach (char character in this.ShortURL)
            {
                if (!ShortURLConstants.validCharactersShortURL.Contains(character))
                    return false;
            }

            return true;
        }
    }
}