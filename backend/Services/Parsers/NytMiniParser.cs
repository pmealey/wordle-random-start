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
        private const int _priority = 5;
        public override int Priority => _priority;
        private const string _gameName = "NYT Mini";
        public override string GameName => _gameName;
        private readonly Regex _parser = new Regex($"NYTM (?<{TimeGroup}>[:\\d]+)", RegexOptions.IgnoreCase);
        protected override Regex Parser => _parser;
        private const string _url = "https://www.nytimes.com/crosswords/game/mini";
        public override string Url => _url;
    }
}
