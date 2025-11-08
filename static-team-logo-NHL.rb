require 'net/http'
require 'uri'
require 'fileutils'

def download_team_logo(team_id, save_to: nil)
  base_url = "https://www-league.nhlstatic.com/images/logos/teams-current-primary-light"
  logo_url = "#{base_url}/#{team_id}.svg"

  uri = URI.parse(logo_url)
  response = Net::HTTP.get_response(uri)

  if response.is_a?(Net::HTTPSuccess)
    if save_to
      FileUtils.mkdir_p(File.dirname(save_to))
      File.write(save_to, response.body, mode: 'wb')
      puts "✅ Logo saved to #{save_to}"
    else
      puts response.body   # or return it for inline use
    end
  else
    warn "❌ Failed to fetch logo for team id #{team_id}: HTTP #{response.code}"
  end
end

if __FILE__ == $0
  # Example usage:
  team_id = ARGV[0] || 26  # default to teamId 26 (LA Kings) if none given
  save_path = "logos/#{team_id}.svg"
  
  download_team_logo(team_id, save_to: save_path)
end
