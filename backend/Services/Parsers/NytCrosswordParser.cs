using System.Text.RegularExpressions;

namespace backend.Services.Parsers
{
    public class NytCrosswordParser : BasicTimeResultParser
    {
        private ILogger<NytCrosswordParser> _logger;

        public NytCrosswordParser(ILogger<NytCrosswordParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override bool Default => false;
        public override string GameName => "NYT Crossword";
        public override string? HelpText => "Alternate entry: \"Nytc 42:42\", \"Nytc 42.42\", or \"Nytc 1:42:42\".";
        protected override Regex Parser => new Regex($"(I solved the (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday) [\\d/]+ New York Times Daily Crossword in|NYTC) (?<{TimeGroup}>[:\\d\\.]+)", RegexOptions.IgnoreCase);
        public override string? Url => null;
    }
}
