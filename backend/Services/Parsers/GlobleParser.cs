using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class GlobleParser : BasicScoreResultParser
    {
        private ILogger<GlobleParser> _logger;

        public GlobleParser(ILogger<GlobleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string Category => "Default";
        public override string GameName => "Globle";
        public override string? HelpText => null;
        protected override Regex Parser => new Regex($"🌎.*?🌍[\\s\n\r]+[^=]*= (?<{ScoreGroup}>\\d+)");
        protected override string? ExtraContent => null;
        public override string Url => "https://globle-game.com";
        protected override string GetCleanResult(string result, Match parserResults)
        {
                return result
                    .Replace("#globle", string.Empty)
                    .Replace("globle-game.com", string.Empty)
                    .Trim();
        }
    }
}
