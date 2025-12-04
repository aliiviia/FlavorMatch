import {
  IconCamera,
  IconPlayerPlay,
  IconBrandInstagram
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h3 className="footer-logo">🍴 FlavorMatch</h3>
          <p className="footer-text">Cooking to the beat of great music.</p>
        </div>

        <div className="footer-cols">
          <div>
            <h4>Recipes</h4>
            <p>Browse All</p>
            <p>Quick Meals</p>
            <p>Desserts</p>
          </div>

          <div>
            <h4>Music</h4>
            <p>Playlists</p>
            <p>Genres</p>
            <p>Artists</p>
          </div>

          <div>
            <h4>Connect</h4>
            <div className="footer-icons flex gap-3 items-center">
              <IconCamera size={20} stroke={1.8} />
              <IconBrandInstagram size={20} stroke={1.8} />
              <IconPlayerPlay size={20} stroke={1.8} />
            </div>
          </div>
        </div>
      </div>

      <p className="footer-copy">© 2025 FlavorMatch. All rights reserved.</p>
    </footer>
  );
}
