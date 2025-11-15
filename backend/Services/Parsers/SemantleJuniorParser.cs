using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SemantleJuniorParser : SemantleParser
    {
        private ILogger<SemantleJuniorParser> _logger;

        public SemantleJuniorParser(ILogger<SemantleJuniorParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string GameName => "Semantle Junior";
        public override string Url => "https://semantle.com/junior";
    }
}
