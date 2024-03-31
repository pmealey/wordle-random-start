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

        public override bool CountWinner => true;
        public override string GameName => "NYT Mini";
        public override string? HelpText => "Alternate entry: \"Nytm 42\", \"Nytm 1:42\", or \"Nytm 1.42\".";
        protected override Regex Parser => new Regex($"(I solved the [\\d/]+ New York Times Mini Crossword in|NYTM) (?<{TimeGroup}>[:\\d\\.]+)!?", RegexOptions.IgnoreCase);
        public override string Url => "https://fpx3r.app.goo.gl/PKC4";
    }
}
