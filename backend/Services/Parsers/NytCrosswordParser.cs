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

        public override string Category => "Word";
        public override bool CountWinner => false;
        public override string GameName => "NYT Crossword";
        public override string? HelpText => "Enter \"Nytc 42:42\", \"Nytc 42.42\", or \"Nytc 1:42:42\" for example.";
        protected override Regex Parser => new Regex($"NYTC (?<{TimeGroup}>[:\\d\\.]+)", RegexOptions.IgnoreCase);
        public override string? Url => null;
    }
}
