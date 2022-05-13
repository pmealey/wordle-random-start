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

        private const string _gameName = "NYT Crossword";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"NYTC (?<{TimeGroup}>[:\\d]+)", RegexOptions.IgnoreCase);
        protected override Regex Parser => _parser;
        private const string _url = null;
        public override string Url => _url;
    }
}
