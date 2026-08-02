import React, { useRef } from 'react';
import { Heart, MapPin, Scale, Star, ArrowRight, User } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductCard = ({ product, isWishlisted, onWishlistToggle, onClick }) => {
  const { isFarmer } = useAuth();
  const { t } = useLanguage();
  const cardRef = useRef(null);

  const {
    _id,
    name,
    description,
    category,
    quantity,
    unit,
    basePrice,
    highestBid,
    location,
    biddingEndTime,
    farmer,
    rating = 4.8,
    isOrganic = false,
    isVerified = true,
    isFeatured = false
  } = product;

  const [imgError, setImgError] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(product.image || product.images?.[0] || '');

  React.useEffect(() => {
    setImgSrc(product.image || product.images?.[0] || '');
    setImgError(false);
  }, [product.image, product.images]);

  const isAuction = biddingEndTime && new Date(biddingEndTime) > new Date();
  const priceDisplay = highestBid || basePrice;
  const unitLabel = unit ? `/${unit}` : '';

  /* Mouse Tilt Parallax (Desktop only) */
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc) * 6; // Max 6 deg tilt
    const rotateY = ((x - xc) / xc) * 6;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
  };

  const renderPlaceholder = () => {
    let gradient = 'linear-gradient(135deg, #10B981, #047857)';
    let label = t('marketplace.productCard.categories.vegetables');
    let icon = '🌱';
    const cat = (category || '').toLowerCase();
    
    if (cat.includes('fruit')) {
      gradient = 'linear-gradient(135deg, #F59E0B, #D97706)';
      label = t('marketplace.productCard.categories.fruits');
      icon = '🍎';
    } else if (cat.includes('grain')) {
      gradient = 'linear-gradient(135deg, #FBBF24, #B45309)';
      label = t('marketplace.productCard.categories.grains');
      icon = '🌾';
    } else if (cat.includes('dairy')) {
      gradient = 'linear-gradient(135deg, #93C5FD, #2563EB)';
      label = t('marketplace.productCard.categories.dairy');
      icon = '🥛';
    } else if (cat.includes('spice')) {
      gradient = 'linear-gradient(135deg, #F87171, #B91C1C)';
      label = t('marketplace.productCard.categories.spices');
      icon = '🌶️';
    } else if (cat.includes('meat')) {
      gradient = 'linear-gradient(135deg, #FCA5A5, #DC2626)';
      label = t('marketplace.productCard.categories.meat');
      icon = '🥩';
    }

    return (
      <div 
        style={{
          width: '100%',
          height: '100%',
          background: gradient,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          fontFamily: 'var(--font-display)',
          padding: '20px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</span>
        <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
          {t('marketplace.productCard.verified')}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="premium-product-card" 
      onClick={onClick}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Gallery Image */}
      <div className="premium-card-gallery">
        {!imgSrc || imgError ? (
          renderPlaceholder()
        ) : (
          <img 
            src={imgSrc} 
            alt={name} 
            loading="lazy"
            className="premium-card-gallery__img" 
            onError={() => setImgError(true)}
          />
        )}
        
        {/* Badges using shared component */}
        <div className="premium-badge-group">
          <Badge variant={isAuction ? 'auction' : 'buynow'}>
            {isAuction ? t('marketplace.productCard.badges.auction') : t('marketplace.productCard.badges.buyNow')}
          </Badge>
          {isOrganic  && <Badge variant="organic">{t('marketplace.productCard.badges.organic')}</Badge>}
          {isVerified && <Badge variant="verified">{t('marketplace.productCard.badges.verified') || t('marketplace.productCard.verified')}</Badge>}
          {isFeatured && <Badge variant="featured">{t('marketplace.productCard.badges.premium')}</Badge>}
        </div>

        {/* Wishlist Button */}
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(_id);
          }}
          className="premium-card-wishlist"
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} color={isWishlisted ? '#ef4444' : '#ffffff'} />
        </button>
      </div>

      {/* Card Body */}
      <div className="premium-card-body">
        <h3 className="premium-card-title">{name}</h3>
        <p className="premium-card-desc">{description}</p>

        {/* Farmer & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '6px 0', fontSize: 'var(--text-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{farmer?.name || t('marketplace.productCard.farmerFallback')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={13} fill="#F59E0B" color="#F59E0B" />
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{rating}</span>
          </div>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <MapPin size={13} />
          <span>{location || t('marketplace.productCard.locationFallback')}</span>
        </div>

        {/* Price & Quantity */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '8px 0' }}>
          <div>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)', display: 'block' }}>
              {isAuction ? t('marketplace.productCard.highestBid') : t('marketplace.productCard.price')}
            </span>
            <span style={{ fontSize: '19px', fontWeight: '800', color: 'var(--color-primary-500)' }}>
              ₹{priceDisplay}{unitLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            <Scale size={13} />
            <span>{quantity} {unit}</span>
          </div>
        </div>

        {/* Availability */}
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#F59E0B', margin: '2px 0 10px 0' }}>
          {isAuction ? `${t('marketplace.productCard.ends')}: ${new Date(biddingEndTime).toLocaleDateString()}` : t('marketplace.productCard.instantBuy')}
        </div>

        {/* Action Button — Pill shape & lift */}
        <button 
          type="button" 
          className="btn btn-primary"
          style={{ 
            width: '100%', 
            height: '42px', 
            borderRadius: '999px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: 'auto',
            transition: 'transform 0.3s var(--ease-spring), box-shadow 0.3s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(31,166,75,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span>{isFarmer ? t('marketplace.productCard.viewDetails') : isAuction ? t('marketplace.productCard.placeBid') : t('marketplace.productCard.badges.buyNow')}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
