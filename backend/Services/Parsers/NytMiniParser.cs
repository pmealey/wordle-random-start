using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class NytMiniParser : BasicTimeResultParser
    {
        private ILogger<NytMiniParser> _logger;

        public NytMiniParser(ILogger<NytMiniParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override string GameName => "NYT Mini";
        public override string? HelpText => "Enter \"Nytm 42\", \"Nytm 1:42\", or \"Nytm 1.42\" for example.";
        protected override Regex Parser => new Regex($"NYTM (?<{TimeGroup}>[:\\d\\.]+)", RegexOptions.IgnoreCase);
        public override string Url => "https://www.nytimes.com/crosswords/game/mini";
    }
}
